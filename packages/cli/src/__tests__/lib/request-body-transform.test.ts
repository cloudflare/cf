import { describe, expect, it } from "vite-plus/test";
import { transformRequestBody } from "../../lib/request-body-transform.js";
import type { RequestBodyTransform } from "@cloudflare/forge/request-transform";

describe("request body transforms", () => {
	it("preserves null, empty objects, arrays, and false while omitting unset fields", () => {
		const mapping: RequestBodyTransform = {
			object: [
				{ key: "removed", value: { literal: null } },
				{ key: "clear", value: { object: [] } },
				{ key: "items", value: { literal: [] } },
				{ key: "enabled", value: { arg: "enabled" } },
				{ key: "missing", value: { arg: "missing" } },
				{
					key: "optional",
					omitIfUnset: "missing",
					value: { object: [{ key: "constant", value: { literal: true } }] },
				},
			],
		};
		expect(transformRequestBody(mapping, { enabled: false })).toEqual({
			removed: null,
			clear: {},
			items: [],
			enabled: false,
		});
	});

	it.each(["__proto__", "constructor", "name.with.dots", "a/b", "☁"])(
		"preserves dynamic map key %s verbatim",
		(name) => {
			const body = transformRequestBody<Record<string, unknown>>(
				{ object: [{ key: { arg: "name" }, value: { literal: null } }] },
				{ name }
			);
			expect(Object.keys(body)).toEqual([name]);
			expect(body[name]).toBeNull();
			expect(Object.getPrototypeOf(body)).toBe(Object.prototype);
		}
	);

	it("parses serialized mappings without interpreting literal object keys as JavaScript", () => {
		const template =
			'{"object":[{"key":"literal","value":{"literal":{"__proto__":{"value":1}}}}]}';
		expect(JSON.stringify(transformRequestBody(template, {}))).toBe(
			'{"literal":{"__proto__":{"value":1}}}'
		);
	});

	it("redacts each use of a sensitive value and preserves the input", () => {
		const args = { secret: "sensitive" };
		const mapping: RequestBodyTransform = {
			object: [
				{ key: "first", value: { arg: "secret" } },
				{
					key: "nested",
					value: { object: [{ key: "second", value: { arg: "secret" } }] },
				},
			],
		};
		expect(transformRequestBody(mapping, args, ["secret"])).toEqual({
			first: "<redacted>",
			nested: { second: "<redacted>" },
		});
		expect(args.secret).toBe("sensitive");
	});
	it("includes a redacted required value when it guards an object entry", () => {
		expect(
			transformRequestBody(
				{
					object: [
						{ key: "secret", omitIfUnset: "value", value: { arg: "value" } },
					],
				},
				{},
				["value"]
			)
		).toEqual({ secret: "<redacted>" });
	});
	it("omits unset inputs whose names match object prototype properties", () => {
		expect(
			transformRequestBody(
				{ object: [{ key: "value", value: { arg: "constructor" } }] },
				{}
			)
		).toEqual({});
	});
});
