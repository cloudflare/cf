import { describe, expect, it } from "vite-plus/test";
import { deriveOutputKind } from "../../../generator/codegen/output-kind.js";
import type { OperationInfo } from "@cloudflare/forge";

describe("deriveOutputKind", () => {
	it.each([
		["application/vnd.google.protobuf", "binary"],
		["application/octet-stream", "binary"],
		["application/zip", "binary"],
		["image/png", "binary"],
		["text/plain", "text"],
		["text/csv", "text"],
		["application/json", "json"],
		["application/problem+json", "json"],
	])("classifies %s responses as %s", (contentType, expectedKind) => {
		const opInfo = {
			responses: {
				"200": {
					content: {
						[contentType]: {},
					},
				},
			},
		} as unknown as OperationInfo;

		expect(deriveOutputKind(opInfo)).toBe(expectedKind);
	});
});
