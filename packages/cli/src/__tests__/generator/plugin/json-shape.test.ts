import { stripTypeScriptTypes } from "node:module";
import { Script } from "node:vm";
import { describe, expect, it } from "vite-plus/test";
import yargs, { type CommandModule } from "yargs";
import { jsonShape } from "../../../../generator/plugin/json-shape.js";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";
import type { ObjectType, Type } from "@cloudflare/forge/plugin";

describe("JSON parameter shapes", () => {
	const files = generateFiles({
		openapi: "3.0.3",
		info: { title: "JSON shapes", version: "1" },
		components: {
			schemas: {
				Action: {
					type: "object",
					required: ["action_type"],
					properties: {
						action_type: {
							type: "string",
							enum: ["webhook", "email"],
							"x-fern-property-name": "kind",
						},
						url: { type: "string", nullable: true },
						enabled: { type: "boolean" },
						config: {
							type: "object",
							properties: { secret: { type: "string" } },
						},
						tags: { type: "array", items: { type: "string" } },
						server_id: { type: "string", readOnly: true },
					},
				},
				Recursive: {
					type: "object",
					properties: { child: { $ref: "#/components/schemas/Recursive" } },
				},
				NullableMap: {
					type: "object",
					nullable: true,
					additionalProperties: { type: "string" },
				},
				SharedRecord: {
					type: "object",
					required: ["id", "created_at", "value"],
					properties: {
						id: { type: "string", readOnly: true },
						created_at: { type: "string", readOnly: true },
						value: { type: "string" },
					},
				},
			},
		},
		paths: {
			"/things": {
				post: {
					summary: "Create a thing",
					"x-fern-sdk-group-name": "things",
					"x-fern-sdk-method-name": "create",
					"x-forge-params": { actions: { description: "Choose actions.\n" } },
					requestBody: {
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										actions: {
											type: "array",
											items: { $ref: "#/components/schemas/Action" },
										},
										matrix: {
											type: "array",
											items: { type: "array", items: { type: "number" } },
										},
										headers: {
											type: "object",
											additionalProperties: { type: "string" },
										},
										trees: {
											type: "array",
											items: { $ref: "#/components/schemas/Recursive" },
										},
										nullable_actions: {
											type: "array",
											nullable: true,
											items: { $ref: "#/components/schemas/Action" },
										},
										nullable_headers: {
											$ref: "#/components/schemas/NullableMap",
										},
										quoted: {
											type: "array",
											items: {
												type: "object",
												required: ["pattern"],
												properties: {
													pattern: { type: "string", enum: ['"?:'] },
												},
											},
										},
										records: {
											type: "array",
											items: { $ref: "#/components/schemas/SharedRecord" },
										},
									},
								},
							},
						},
					},
					responses: { "200": { description: "OK" } },
				},
			},
		},
	});
	const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
		commands: CommandMeta[];
	};
	const options = metadata.commands.find(
		(command) => command.command === "cf things create"
	)?.options;
	const source = stripTypeScriptTypes(files.get("things/create.ts") ?? "")
		.replace(/^import[\s\S]*?;\n/gm, "")
		.replace("export default command;", "command;");
	const command = new Script(source).runInNewContext() as CommandModule;

	it("shows the same first-level wire shape in help, command metadata, and cf schema", async () => {
		const description =
			'Choose actions. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"action_type": "webhook" | "email", "url"?: (string | null), "enabled"?: boolean, "config"?: {...}, "tags"?: [string]}]. ? marks optional keys.';
		expect(
			options?.find((option) => option.name === "actions")?.description
		).toBe(description);
		const schemas = JSON.parse(files.get("_meta/schemas.json") ?? "") as {
			schemas: Record<
				string,
				{ requestBodyFields: { name: string; description: string }[] }
			>;
		};
		expect(
			schemas.schemas["things create"]?.requestBodyFields.find(
				(field) => field.name === "actions"
			)?.description
		).toBe(description);
		const help = await yargs(["create"]).command(command).wrap(null).getHelp();
		expect(help).toContain(description);
	});

	it.each([
		["headers", 'Shape: {"<key>": string}.'],
		["matrix", "Shape: [[number]]."],
		["trees", 'Shape: [{"child"?: {...}}]. ? marks optional keys.'],
		["records", 'Shape: [{"value": string}].'],
	])("describes %s without expanding nested objects", (name, shape) => {
		expect(
			options?.find((option) => option.name === name)?.description
		).toContain(shape);
	});

	it("omits top-level null through references while retaining nested nullable fields", () => {
		const description = (name: string) =>
			options?.find((option) => option.name === name)?.description;
		expect(description("nullable-headers")).toContain(
			'Shape: {"<key>": string}.'
		);
		expect(description("nullable-actions")?.split(" Shape: ")[1]).toBe(
			description("actions")?.split(" Shape: ")[1]
		);
		expect(description("nullable-actions")).toContain(
			'"url"?: (string | null)'
		);
	});

	it("does not mistake a literal optional-marker string for an optional key", () => {
		const description = options?.find(
			(option) => option.name === "quoted"
		)?.description;
		expect(description).toContain('Shape: [{"pattern": "\\\"?:"}].');
		expect(description).not.toContain("marks optional keys");
	});
});

describe("bounded JSON shape rendering", () => {
	it("limits enum alternatives without inventing example values", () => {
		expect(jsonShape({ kind: "enum", values: ["a", "b", "c", "d"] }).text).toBe(
			'"a" | "b" | "c" | ...more'
		);
	});

	it("bounds large object shapes and preserves complete delimiters", () => {
		const type: ObjectType = {
			kind: "object",
			fields: Array.from({ length: 100 }, (_, i) => ({
				wireName: `field_${i}`,
				name: {
					words: ["field", String(i)],
					isEmpty: false,
					camel: () => `field${i}`,
					pascal: () => `Field${i}`,
					snake: () => `field_${i}`,
					kebab: () => `field-${i}`,
					equals: () => false,
					toString: () => `field ${i}`,
				},
				required: true,
				description: "",
				deprecated: false,
				readOnly: false,
				sensitive: false,
				default: undefined,
				type: { kind: "scalar", scalar: "string" },
			})),
			extra: undefined,
		};
		expect(jsonShape(type).text).toBe(
			'{"field_0": string, "field_1": string, "field_2": string, "field_3": string, "field_4": string, ...more}'
		);
		expect(
			jsonShape({
				...type,
				fields: type.fields.map((field) => ({
					...field,
					wireName: field.wireName.repeat(20),
				})),
			}).text.length
		).toBeLessThanOrEqual(240);
		expect(
			jsonShape({
				...type,
				fields: type.fields.map((field, i) => ({ ...field, required: i < 5 })),
			}).hasOptionalKeys
		).toBe(false);
		expect(
			jsonShape({
				...type,
				fields: type.fields.map((field) => ({ ...field, required: false })),
			}).hasOptionalKeys
		).toBe(true);
		const prioritized = jsonShape({
			...type,
			fields: type.fields.slice(0, 6).map((field, i) => ({
				...field,
				required: i === 0 || i === 5,
				readOnly: i === 0,
			})),
		}).text;
		expect(prioritized).toMatch(/^\{"field_5": string, "field_1"\?: string, /);
		expect(prioritized).not.toContain('"field_0"');
		expect(
			jsonShape({
				...type,
				fields: type.fields.map((field) => ({ ...field, readOnly: true })),
			})
		).toEqual({ text: "{}", hasOptionalKeys: false });
		const longFields = type.fields.slice(0, 3).map((field) => ({
			...field,
			wireName: `${field.wireName.repeat(9)}_k`,
		}));
		const composed = jsonShape({
			kind: "array",
			minItems: undefined,
			maxItems: undefined,
			elem: {
				kind: "intersection",
				members: [
					{ ...type, fields: longFields },
					{ ...type, fields: [], extra: { kind: "scalar", scalar: "string" } },
				],
			},
		}).text;
		expect(composed).toContain(JSON.stringify(longFields[0]?.wireName));
		expect(composed.length).toBeLessThanOrEqual(240);
	});

	it("bounds recursive array types", () => {
		const type: Type = {
			kind: "array",
			elem: { kind: "scalar", scalar: "unknown" },
			minItems: undefined,
			maxItems: undefined,
		};
		Object.assign(type, { elem: type });
		expect(jsonShape(type).text).toContain("...more");
		expect(jsonShape(type).text.length).toBeLessThan(40);
	});

	it("keeps union alternatives distinct and intersections explicit", () => {
		const members: Type[] = [
			{ kind: "scalar", scalar: "string" },
			{ kind: "scalar", scalar: "boolean" },
		];
		expect(
			jsonShape({
				kind: "union",
				members,
				exclusive: false,
				discriminator: undefined,
			}).text
		).toBe("(string | boolean)");
		expect(jsonShape({ kind: "intersection", members }).text).toBe(
			"(string & boolean)"
		);
	});

	it("removes redundant members without dropping distinct union alternatives", () => {
		const boolean: Type = { kind: "scalar", scalar: "boolean" };
		const string: Type = { kind: "scalar", scalar: "string" };
		const empty: Type = { kind: "object", fields: [], extra: undefined };
		const map: Type = { ...empty, extra: string };
		expect(
			jsonShape({ kind: "intersection", members: [boolean, boolean] }).text
		).toBe("boolean");
		expect(
			jsonShape({ kind: "intersection", members: [empty, map] }).text
		).toBe('{"<key>": string}');
		expect(
			jsonShape({ kind: "intersection", members: [empty, empty] }).text
		).toBe("{}");
		expect(
			jsonShape({
				kind: "union",
				exclusive: false,
				discriminator: undefined,
				members: [boolean, boolean, boolean, boolean, string],
			}).text
		).toBe("(boolean | string)");
		expect(
			jsonShape({
				kind: "union",
				exclusive: false,
				discriminator: undefined,
				members: [empty, map],
			}).text
		).toBe('({} | {"<key>": string})');
	});

	it("flattens nested nullable unions before deduplicating their alternatives", () => {
		const nullType: Type = { kind: "scalar", scalar: "null" };
		const object: Type = { kind: "object", fields: [], extra: undefined };
		const nullable: Type = {
			kind: "union",
			exclusive: false,
			discriminator: undefined,
			members: [object, nullType],
		};
		const nested: Type = { ...nullable, members: [nullable, nullType] };
		const type: Type = { kind: "object", fields: [], extra: nested };
		expect(jsonShape(type).text).toBe('{"<key>": ({...} | null)}');
	});
});
