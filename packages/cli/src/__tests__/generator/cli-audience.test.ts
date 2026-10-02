import { describe, expect, it } from "vite-plus/test";
import {
	filterForCliAudience,
	includesCliAudience,
} from "../../../generator/cli-audience.js";
import type { ForgeOpenApiDocument } from "@cloudflare/forge";

function operation(audiences?: unknown): Record<string, unknown> {
	return {
		operationId: "example",
		...(audiences === undefined ? {} : { "x-fern-audiences": audiences }),
	};
}

describe("includesCliAudience", () => {
	it("includes operations without x-fern-audiences", () => {
		expect(includesCliAudience(operation())).toBe(true);
		expect(
			includesCliAudience({
				...operation(),
				"x-fern-audiences": null,
			})
		).toBe(true);
	});

	it("includes operations targeting cf-cli", () => {
		expect(includesCliAudience(operation("cf-cli"))).toBe(true);
		expect(includesCliAudience(operation(["typescript", "cf-cli"]))).toBe(true);
	});

	it("excludes operations with audiences that do not target cf-cli", () => {
		expect(includesCliAudience(operation("typescript"))).toBe(false);
		expect(includesCliAudience(operation(["typescript", "python"]))).toBe(
			false
		);
		expect(includesCliAudience(operation([]))).toBe(false);
		expect(includesCliAudience(operation({ audience: "cf-cli" }))).toBe(false);
	});
});

describe("filterForCliAudience", () => {
	it("removes only operations explicitly targeting other audiences", () => {
		const openapi = {
			openapi: "3.0.0",
			info: { title: "test", version: "1.0.0" },
			paths: {
				"/examples": {
					parameters: [],
					get: operation(),
					post: operation(["cf-cli"]),
					delete: operation(["python"]),
				},
			},
		} as unknown as ForgeOpenApiDocument;

		expect(filterForCliAudience(openapi)).toBe(1);
		expect(openapi.paths?.["/examples"]?.get).toBeDefined();
		expect(openapi.paths?.["/examples"]?.post).toBeDefined();
		expect(openapi.paths?.["/examples"]?.delete).toBeUndefined();
		expect(openapi.paths?.["/examples"]?.parameters).toEqual([]);
	});
});
