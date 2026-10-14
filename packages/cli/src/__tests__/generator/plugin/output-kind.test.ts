import { describe, expect, it } from "vite-plus/test";
import { outputKind } from "../../../../generator/plugin/emit/index.js";
import { operation } from "../../helpers/cli-plugin.js";

describe("outputKind", () => {
	it.each([
		["application/vnd.google.protobuf", "binary"],
		["application/octet-stream", "binary"],
		["application/zip", "binary"],
		["image/png", "binary"],
		["text/plain", "text"],
		["text/csv", "text"],
		["application/json", "json"],
		["application/geo+json", "json"],
	])("classifies %s responses as %s", (contentType, expectedKind) => {
		const op = operation("get", "/", {
			responses: [["200", { content: [contentType] }]],
		});

		expect(outputKind(op)).toBe(expectedKind);
	});
});
