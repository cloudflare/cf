import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { applyOpenApiOverlay } from "../../../generator/openapi-overlay.js";
import type { ForgeOpenApiDocument } from "../../../generator/openapi.js";

const directories: string[] = [];
afterEach(() => {
	for (const directory of directories.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

function overlay(actions: object[]): string {
	const directory = mkdtempSync(join(tmpdir(), "cf-openapi-overlay-"));
	directories.push(directory);
	const path = join(directory, "test.overlay.json");
	writeFileSync(
		path,
		JSON.stringify({
			overlay: "1.1.0",
			info: { title: "Test overlay", version: "1.0.0" },
			actions,
		})
	);
	return path;
}

function document(): ForgeOpenApiDocument {
	return {
		openapi: "3.0.3",
		info: { title: "Test API", version: "1.0.0" },
		paths: {},
		components: {
			schemas: {
				Name: { type: "string" },
				Alias: { $ref: "#/components/schemas/Name" },
			},
		},
	};
}

describe("applyOpenApiOverlay", () => {
	it("applies standard updates and removals in order, preserving references and the input", async () => {
		const source = document();
		const original = structuredClone(source);
		const path = overlay([
			{ target: "$", update: { "x-temporary": true } },
			{
				target: '$["info"]',
				update: { title: "Overlaid API", "x-forge-custom": { enabled: true } },
			},
			{ target: '$["x-temporary"]', remove: true },
		]);

		const overlaid = await applyOpenApiOverlay(source, path);

		expect(overlaid).toEqual({
			...original,
			info: {
				title: "Overlaid API",
				version: "1.0.0",
				"x-forge-custom": { enabled: true },
			},
		});
		expect(source).toEqual(original);
	});

	it.each([
		[{ update: { "x-test": true } }, "target"],
		[{ target: "$[", update: {} }, "Invalid JSONPath"],
		[{ target: "$", update: "wrong type" }, "object"],
	])("rejects invalid overlay actions: %j", async (action, message) => {
		const source = document();
		const original = structuredClone(source);
		const path = overlay([action]);
		const applying = applyOpenApiOverlay(source, path);

		await expect(applying).rejects.toThrow(message);
		await expect(applying).rejects.toThrow(path);
		expect(source).toEqual(original);
	});

	it("fails when an overlay introduces an unresolved reference", async () => {
		const path = overlay([
			{
				target: '$["components"]["schemas"]',
				update: { Missing: { $ref: "#/components/schemas/Absent" } },
			},
		]);
		await expect(applyOpenApiOverlay(document(), path)).rejects.toThrow(
			"Can't resolve $ref"
		);
	});
});
