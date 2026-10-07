import { describe, expect, it } from "vite-plus/test";
import { deriveOutputKind } from "../../../generator/codegen/output-kind.js";
import type { OperationInfo } from "@cloudflare/forge";

describe("deriveOutputKind", () => {
	it("classifies protobuf responses as binary", () => {
		const opInfo = {
			responses: {
				"200": {
					content: {
						"application/vnd.google.protobuf": {},
					},
				},
			},
		} as unknown as OperationInfo;

		expect(deriveOutputKind(opInfo)).toBe("binary");
	});
});
