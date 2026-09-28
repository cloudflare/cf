import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vitest";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "../../lib/body-parser.js";

/**
 * Unit tests for `lib/body-parser.ts` — the `--body` ingestion path and
 * the `setNestedValue` reconstructor that turns flat CLI flags back into
 * a nested request body.
 *
 * cf does no value "hardening": the body is JSON-serialised by the SDK
 * before sending, so control bytes escape into valid JSON and the API is
 * the authority on what a field accepts. These tests therefore pin shape
 * fidelity (objects/arrays/scalars round-trip) and `@file` ingestion —
 * NOT rejection of control chars / deep nesting / prototype keys, which
 * are intentionally not enforced.
 */

describe("parseBody", () => {
	it("parses an object", () => {
		expect(parseBody('{"name":"db","port":5432}')).toEqual({
			name: "db",
			port: 5432,
		});
	});

	it("parses non-object JSON (arrays and scalars) for APIs that need them", () => {
		expect(parseBody('["a","b"]')).toEqual(["a", "b"]);
		expect(parseBody('"just-a-string"')).toBe("just-a-string");
		expect(parseBody("42")).toBe(42);
		expect(parseBody("true")).toBe(true);
		expect(parseBody("null")).toBeNull();
	});

	it("throws a clear error on invalid JSON", () => {
		expect(() => parseBody("{not json")).toThrow(
			"Invalid JSON in --body. Expected valid JSON."
		);
	});

	// Control chars are valid JSON string content; the SDK escapes them
	// on the wire. cf passes them through verbatim rather than second-
	// guessing the API. (The `\u0001` escape decodes to a real C1 byte.)
	it("passes control characters through verbatim", () => {
		expect(parseBody('{"k":"bad\\u0001"}')).toEqual({ k: "bad\u0001" });
		expect(parseBody('["ok","bad\\u0001"]')).toEqual(["ok", "bad\u0001"]);
		expect(parseBody('"bad\\u0001"')).toBe("bad\u0001");
	});

	it("does not cap nesting depth", () => {
		const deep = '{"a":{"b":{"c":{"d":{"e":{"f":{"g":"x"}}}}}}}';
		expect(parseBody(deep)).toEqual({
			a: { b: { c: { d: { e: { f: { g: "x" } } } } } },
		});
	});

	describe("@file ingestion", () => {
		runInTempDir();

		it("reads and parses JSON from `@path`", async () => {
			await seed({ "body.json": '{"from":"file"}' });
			expect(parseBody("@body.json")).toEqual({ from: "file" });
		});

		it("errors on a bare `@` with no path", () => {
			expect(() => parseBody("@")).toThrow(
				"--body '@' must be followed by a file path (got empty path)"
			);
		});

		it("wraps a missing-file read error with the path", () => {
			expect(() => parseBody("@missing.json")).toThrow(
				/--body: cannot read file at 'missing\.json'/
			);
		});

		it("reports invalid JSON read from a file", async () => {
			await seed({ "bad.json": "{nope" });
			expect(() => parseBody("@bad.json")).toThrow(
				"Invalid JSON in --body. Expected valid JSON."
			);
		});
	});
});

describe("parseObjectArray", () => {
	it("parses a lossless JSON array of objects", () => {
		expect(
			parseObjectArray(
				'[{"version_id":"v1","percentage":40,"metadata":{"message":"one"}},{"version_id":"v2","percentage":60}]',
				"versions"
			)
		).toEqual([
			{
				version_id: "v1",
				percentage: 40,
				metadata: { message: "one" },
			},
			{ version_id: "v2", percentage: 60 },
		]);
		expect(parseObjectArray("[]", "versions")).toEqual([]);
	});

	it("returns undefined when an optional flag is absent", () => {
		expect(parseObjectArray(undefined, "versions")).toBeUndefined();
	});

	it.each([
		["an object", '{"version_id":"v1"}'],
		["null", "null"],
		["a scalar item", '["v1"]'],
		["a null item", "[null]"],
		["an array item", "[[1]]"],
	])("rejects %s", (_label, input) => {
		expect(() => parseObjectArray(input, "versions")).toThrow(
			"--versions must be a JSON array of objects."
		);
	});

	it("names the flag in JSON parse errors", () => {
		expect(() => parseObjectArray("[{nope", "versions")).toThrow(
			"Invalid JSON in --versions. Expected valid JSON."
		);
	});

	it("rejects repeated occurrences of the single JSON flag", () => {
		expect(() => parseObjectArray(["[]", "[]"], "versions")).toThrow(
			"--versions must be provided once as a JSON array of objects."
		);
	});

	describe("@file ingestion", () => {
		runInTempDir();

		it("reads and parses an object array from `@path`", async () => {
			await seed({
				"versions.json": '[{"version_id":"v1","percentage":100}]',
			});
			expect(parseObjectArray("@versions.json", "versions")).toEqual([
				{ version_id: "v1", percentage: 100 },
			]);
		});

		it("names the flag in file errors", () => {
			expect(() => parseObjectArray("@missing.json", "versions")).toThrow(
				/--versions: cannot read file at 'missing\.json'/
			);
		});
	});
});

describe("setNestedValue", () => {
	it("creates intermediate objects along the path", () => {
		const body: Record<string, unknown> = {};
		setNestedValue(body, ["origin", "host"], "db.example.com");
		expect(body).toEqual({ origin: { host: "db.example.com" } });
	});

	it("merges into existing intermediate objects", () => {
		const body: Record<string, unknown> = { origin: { port: 5432 } };
		setNestedValue(body, ["origin", "host"], "db.example.com");
		expect(body).toEqual({ origin: { host: "db.example.com", port: 5432 } });
	});

	it("sets a top-level value with a single-element path", () => {
		const body: Record<string, unknown> = {};
		setNestedValue(body, ["name"], "value");
		expect(body).toEqual({ name: "value" });
	});

	it("is a no-op for an empty path", () => {
		const body: Record<string, unknown> = { keep: true };
		setNestedValue(body, [], "ignored");
		expect(body).toEqual({ keep: true });
	});

	it("preserves non-string values verbatim", () => {
		const body: Record<string, unknown> = {};
		setNestedValue(body, ["count"], 3);
		setNestedValue(body, ["enabled"], false);
		setNestedValue(body, ["tags"], ["a", "b"]);
		expect(body).toEqual({ count: 3, enabled: false, tags: ["a", "b"] });
	});

	it("passes control characters in string values through verbatim", () => {
		const body: Record<string, unknown> = {};
		setNestedValue(body, ["name"], "has\u0000byte");
		expect(body).toEqual({ name: "has\u0000byte" });
	});
});

describe("compactBody", () => {
	it("removes undefined values and empty nested objects", () => {
		expect(
			compactBody<{ name?: string; origin?: { host?: string } }>({
				name: "example",
				origin: { host: undefined },
			})
		).toEqual({ name: "example" });
	});

	it("preserves arrays, null, false, and zero", () => {
		expect(
			compactBody<{
				values: string[];
				nullable: null;
				enabled: boolean;
				count: number;
			}>({
				values: [],
				nullable: null,
				enabled: false,
				count: 0,
			})
		).toEqual({ values: [], nullable: null, enabled: false, count: 0 });
	});
});
