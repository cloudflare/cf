import { describe, expect, it } from "vite-plus/test";
import {
	describeSchemaFailure,
	pickSchema,
	SCHEMA_HELP_TIMEOUT_MS,
} from "../../lib/schema-cache.js";

describe("schema cache", () => {
	it("gives schema-backed help a five-second network budget", () => {
		expect(SCHEMA_HELP_TIMEOUT_MS).toBe(5000);
	});

	it("normalises the SDK timeout message", () => {
		expect(describeSchemaFailure(new Error('"timeout"'))).toBe(
			"the request timed out"
		);
	});

	it("gives credential-source-neutral guidance for rejected credentials", () => {
		expect(describeSchemaFailure({ statusCode: 401 })).toBe(
			"credentials were rejected; update `CLOUDFLARE_API_TOKEN` or run `cf auth login`"
		);
	});

	it("accepts the recursive validation keywords used by registrar schemas", () => {
		const registrationSchema = {
			type: "object",
			additionalProperties: false,
			properties: {
				kind: {
					title: "Kind",
					oneOf: [
						{ type: "string", const: "A", title: "Type A" },
						{ type: "string", const: "B", title: "Type B" },
					],
				},
				codes: { type: "array", items: { type: "string" }, minItems: 1 },
			},
			allOf: [
				{
					if: { required: ["kind"], properties: { kind: { const: "A" } } },
					// oxlint-disable-next-line unicorn/no-thenable -- JSON Schema keyword
					then: { required: ["codes"] },
				},
			],
		};

		expect(
			pickSchema(
				{ registration_schema: registrationSchema },
				"registration_schema"
			)
		).toEqual(registrationSchema);
		expect(
			pickSchema(
				{
					registration_schema: {
						type: "object",
						properties: { codes: { type: "array", minItems: "one" } },
					},
				},
				"registration_schema"
			)
		).toBeUndefined();
	});

	it("accepts a schema whose object structure is supplied only by allOf", () => {
		const schema = {
			allOf: [
				{
					type: "object",
					required: ["name"],
					properties: { name: { type: "string" } },
				},
				{
					type: "object",
					properties: { years: { type: "integer" } },
				},
			],
		};

		expect(pickSchema({ input: schema }, "input")).toEqual(schema);
	});

	it("rejects empty type arrays while accepting non-empty type arrays", () => {
		const schema = {
			type: ["object", "null"],
			properties: { name: { type: ["string", "null"] } },
		};

		expect(pickSchema({ input: schema }, "input")).toEqual(schema);
		expect(
			pickSchema(
				{
					input: {
						type: "object",
						properties: { name: { type: [] } },
					},
				},
				"input"
			)
		).toBeUndefined();
	});

	it.each(["oneOf", "anyOf", "allOf"] as const)(
		"rejects empty $keyword arrays while accepting non-empty arrays",
		(keyword) => {
			const schema = { [keyword]: [{ type: "object", properties: {} }] };

			expect(pickSchema({ input: schema }, "input")).toEqual(schema);
			expect(pickSchema({ input: { [keyword]: [] } }, "input")).toBeUndefined();
		}
	);

	it("accepts OpenAPI boolean and JSON Schema numeric exclusive bounds", () => {
		const schema = {
			type: "object",
			properties: {
				openapi: {
					type: "number",
					minimum: -5,
					exclusiveMinimum: false,
					maximum: 5,
					exclusiveMaximum: true,
				},
				jsonSchema: {
					type: "number",
					exclusiveMinimum: -5,
					exclusiveMaximum: 5,
				},
			},
		};

		expect(pickSchema({ input: schema }, "input")).toEqual(schema);
		expect(
			pickSchema(
				{
					input: {
						type: "object",
						properties: {
							value: {
								type: "number",
								exclusiveMinimum: "true",
							},
						},
					},
				},
				"input"
			)
		).toBeUndefined();
	});
});
