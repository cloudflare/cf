import { describe, expect, it } from "vite-plus/test";
import { applyTemporaryFlagNames } from "../../../generator/flag-names-cli-compat.js";
import type { ForgeOpenApiDocument } from "../../../generator/openapi.js";

const PRECURSOR = "/zones/{zone_id}/precursor";
const PROFILE =
	"/accounts/{account_id}/cloudforce-one/v2/priority-intelligence/profile";

function document(): ForgeOpenApiDocument {
	return {
		paths: {
			[PRECURSOR]: {
				put: {
					operationId: "precursor-for-a-zone-update-config",
					requestBody: {
						content: {
							"application/json": {
								schema: { $ref: "#/components/schemas/precursor_config" },
							},
						},
					},
				},
			},
			[PROFILE]: {
				put: {
					operationId: "put_PirProfilePut",
					requestBody: {
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: { profile: { type: "string" } },
								},
							},
						},
					},
				},
			},
		},
		components: {
			schemas: {
				precursor_config: {
					type: "object",
					properties: { mode: { $ref: "#/components/schemas/precursor_mode" } },
				},
				precursor_mode: { type: "string", enum: ["off", "monitor", "arm"] },
			},
		},
	};
}

const overrides = (doc: ForgeOpenApiDocument, path: string, method: string) =>
	doc.paths?.[path]?.[method]?.["x-forge-params"];

describe("applyTemporaryFlagNames", () => {
	it("names each field and keeps its other overrides", () => {
		const doc = document();
		const profile = doc.paths?.[PROFILE]?.put;
		if (profile) {
			profile["x-forge-params"] = { profile: { description: "Kept" } };
		}
		applyTemporaryFlagNames(doc);
		expect(overrides(doc, PRECURSOR, "put")).toEqual({
			mode: { flagName: "detection-mode" },
		});
		expect(overrides(doc, PROFILE, "put")).toEqual({
			profile: { description: "Kept", flagName: "organization-profile" },
		});
	});

	it.each<[string, (doc: ForgeOpenApiDocument) => void, string]>([
		[
			"a missing operation",
			(doc) => {
				delete doc.paths?.[PROFILE]?.put;
			},
			"operation missing",
		],
		[
			"a renamed operation",
			(doc) => {
				const op = doc.paths?.[PROFILE]?.put;
				if (op) {
					op.operationId = "put_PirProfileReplace";
				}
			},
			'operationId is now "put_PirProfileReplace"',
		],
		[
			"a missing field",
			(doc) => {
				const op = doc.paths?.[PROFILE]?.put;
				if (op) {
					op.requestBody = {
						content: { "application/json": { schema: { type: "object" } } },
					};
				}
			},
			"field missing",
		],
		[
			"a retyped field",
			(doc) => {
				const schemas = doc.components?.["schemas"] as Record<string, object>;
				schemas["precursor_mode"] = { type: "integer" };
			},
			'field type is now "integer"',
		],
		[
			"an upstream flagName",
			(doc) => {
				const op = doc.paths?.[PROFILE]?.put;
				if (op) {
					op["x-forge-params"] = { profile: { flagName: "org-profile" } };
				}
			},
			'upstream now sets x-forge-params["profile"].flagName',
		],
	])("fails on %s without renaming anything", (_, change, reason) => {
		const doc = document();
		change(doc);
		expect(() => applyTemporaryFlagNames(doc)).toThrow(reason);
		expect(overrides(doc, PRECURSOR, "put")).toBeUndefined();
	});

	it("reports every stale entry in one error", () => {
		const doc = document();
		delete doc.paths?.[PRECURSOR];
		delete doc.paths?.[PROFILE];
		expect(() => applyTemporaryFlagNames(doc)).toThrow(
			[
				"Pinned Forge OpenAPI changed for PUT /zones/{zone_id}/precursor body field `mode` (operation missing); remove or revise its temporary CLI flag name in generator/flag-names-cli-compat.ts",
				`Pinned Forge OpenAPI changed for PUT ${PROFILE} body field \`profile\` (operation missing); remove or revise its temporary CLI flag name in generator/flag-names-cli-compat.ts`,
			].join("\n")
		);
	});
});
