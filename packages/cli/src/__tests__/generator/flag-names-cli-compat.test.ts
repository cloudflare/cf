import { describe, expect, it } from "vite-plus/test";
import { applyTemporaryFlagNames } from "../../../generator/flag-names-cli-compat.js";
import type { ForgeOpenApiDocument } from "../../../generator/openapi.js";

const PRECURSOR = "/zones/{zone_id}/precursor";
const PROFILE =
	"/accounts/{account_id}/cloudforce-one/v2/priority-intelligence/profile";
const ONRAMP = "/accounts/{account_id}/magic/cloud/onramps/{onramp_id}";

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
			[ONRAMP]: {
				delete: {
					operationId: "onramps-delete",
					parameters: [
						{ name: "destroy", in: "query", schema: { type: "boolean" } },
						{ $ref: "#/components/parameters/force" },
					],
				},
			},
		},
		components: {
			parameters: {
				force: { name: "force", in: "query", schema: { type: "boolean" } },
			},
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
		expect(overrides(doc, ONRAMP, "delete")).toEqual({
			force: { flagName: "force-delete" },
		});
	});

	it.each<[string, (doc: ForgeOpenApiDocument) => void, string]>([
		[
			"a missing operation",
			(doc) => {
				delete doc.paths?.[ONRAMP]?.delete;
			},
			"operation missing",
		],
		[
			"a renamed operation",
			(doc) => {
				const op = doc.paths?.[ONRAMP]?.delete;
				if (op) {
					op.operationId = "onramps-remove";
				}
			},
			'operationId is now "onramps-remove"',
		],
		[
			"a missing field",
			(doc) => {
				const op = doc.paths?.[ONRAMP]?.delete;
				if (op) {
					op.parameters = [];
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
				const op = doc.paths?.[ONRAMP]?.delete;
				if (op) {
					op["x-forge-params"] = { force: { flagName: "force-remove" } };
				}
			},
			'upstream now sets x-forge-params["force"].flagName',
		],
	])("fails on %s without renaming anything", (_, change, reason) => {
		const doc = document();
		change(doc);
		expect(() => applyTemporaryFlagNames(doc)).toThrow(reason);
		expect(overrides(doc, PROFILE, "put")).toBeUndefined();
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
