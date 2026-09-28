import { describe, expect, it, vi } from "vitest";
import { loadMeta } from "../../lib/metadata.js";

vi.mock("node:sea", () => ({
	getAsset: (filename: string) => {
		if (filename === "valid.json") {
			return '{"ok":true}';
		}
		if (filename === "invalid.json") {
			return '{"ok":false}';
		}
		throw new Error("Asset not found");
	},
	isSea: () => true,
}));

function isValid(value: unknown): value is { ok: true } {
	return (
		typeof value === "object" &&
		value !== null &&
		"ok" in value &&
		value.ok === true
	);
}

describe("loadMeta in a single executable", () => {
	it("loads and validates embedded metadata", () => {
		expect(loadMeta("file:///cf", "valid.json", isValid)).toEqual({
			ok: true,
		});
	});

	it("rejects invalid or missing assets", () => {
		expect(loadMeta("file:///cf", "invalid.json", isValid)).toBeNull();
		expect(loadMeta("file:///cf", "missing.json", isValid)).toBeNull();
	});
});
