import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { assertCliCompatSource } from "../../../generator/cli-compat-guards.js";
import { applyOpenApiOverlay } from "../../../generator/openapi-overlay.js";
import type { ForgeOpenApiDocument } from "../../../generator/openapi.js";

const PRECURSOR = "/zones/{zone_id}/precursor";
const PROFILE =
	"/accounts/{account_id}/cloudforce-one/v2/priority-intelligence/profile";
const EXCLUDED_RECIPIENT =
	"/accounts/{account_id}/shares/{share_id}/excluded-recipients";

const SECRETS = "/accounts/{account_id}/workers/scripts/{script_name}/secrets";
const overlayPath = fileURLToPath(
	new URL("../../../generator/cli-compat.overlay.yaml", import.meta.url)
);

async function applyCompatibilityOverlay(doc: ForgeOpenApiDocument) {
	assertCliCompatSource(doc);
	return applyOpenApiOverlay(doc, overlayPath);
}

function document(): ForgeOpenApiDocument {
	return {
		openapi: "3.0.3",
		info: { title: "CLI compatibility fixture", version: "1.0.0" },
		paths: {
			[SECRETS]: {
				put: {
					operationId: "worker-put-script-secret",
					"x-fern-sdk-group-name": ["workers", "secrets"],
					"x-fern-sdk-method-name": "update",
				},
			},
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
			[EXCLUDED_RECIPIENT]: {
				post: {
					operationId: "share-excluded-recipient-create",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["account_id"],
									properties: { account_id: { type: "string" } },
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

function setProfileBody(doc: ForgeOpenApiDocument, schema: object): void {
	const op = doc.paths?.[PROFILE]?.put;
	if (op) {
		op.requestBody = { content: { "application/json": { schema } } };
	}
}

const organizationShape = {
	type: "object",
	properties: {
		organization: { type: "object" },
		revision: { type: "integer" },
	},
};

describe("CLI compatibility overlay", () => {
	it("names each field and keeps its other overrides", async () => {
		const doc = document();
		const profile = doc.paths?.[PROFILE]?.put;
		if (profile) {
			profile["x-forge-params"] = { profile: { description: "Kept" } };
		}
		const original = structuredClone(doc);
		const overlaid = await applyCompatibilityOverlay(doc);
		expect(overrides(overlaid, PRECURSOR, "put")).toEqual({
			mode: { flagName: "detection-mode" },
		});
		expect(overrides(overlaid, PROFILE, "put")).toEqual({
			profile: { description: "Kept", flagName: "organization-profile" },
		});
		expect(overrides(overlaid, EXCLUDED_RECIPIENT, "post")).toEqual({
			account_id: { flagName: "excluded-account-id" },
		});
		expect(overrides(overlaid, SECRETS, "put")).toEqual({
			name: { positional: true, required: true },
		});
		expect(doc).toEqual(original);
	});

	it("accepts the legacy dotted Worker secret group", async () => {
		const doc = document();
		const op = doc.paths?.[SECRETS]?.put;
		if (op) {
			op["x-fern-sdk-group-name"] = "workers.secrets";
		}
		const overlaid = await applyCompatibilityOverlay(doc);
		expect(overrides(overlaid, SECRETS, "put")).toEqual({
			name: { positional: true, required: true },
		});
	});

	it.each<[string, unknown]>([
		["operationId", "worker-put-secret"],
		["x-forge-hidden", false],
		["x-fern-sdk-group-name", ["workers", "other"]],
		["x-fern-sdk-method-name", "replace"],
		["x-forge-params", { name: { positional: true, required: true } }],
	])("rejects a changed Worker secret %s", (key, value) => {
		const doc = document();
		const op = doc.paths?.[SECRETS]?.put;
		if (op) {
			op[key] = value;
		}
		expect(() => assertCliCompatSource(doc)).toThrow(`PUT ${SECRETS}`);
		expect(overrides(doc, PRECURSOR, "put")).toBeUndefined();
	});

	it("rejects a missing Worker secret operation", () => {
		const doc = document();
		delete doc.paths?.[SECRETS];
		expect(() => assertCliCompatSource(doc)).toThrow(`PUT ${SECRETS}`);
	});

	it.each([
		{ type: "string" },
		{ $ref: "#/components/schemas/precursor_mode" },
		{ allOf: [{ $ref: "#/components/schemas/precursor_mode" }] },
	])("names a field wrapped in a single allOf: %j", async (schema) => {
		const doc = document();
		const schemas = doc.components?.["schemas"] as Record<string, object>;
		const mode = {
			allOf: [schema],
			"x-fern-property-name": "precursor-mode",
		};
		schemas["precursor_config"] = {
			type: "object",
			properties: { mode },
		};

		const overlaid = await applyCompatibilityOverlay(doc);

		expect(overrides(overlaid, PRECURSOR, "put")).toEqual({
			mode: { flagName: "detection-mode" },
		});
		expect(mode).toEqual({
			allOf: [schema],
			"x-fern-property-name": "precursor-mode",
		});
	});

	it.each(["anyOf", "oneOf"])(
		"names a field in one of the body's %s shapes",
		async (key) => {
			const doc = document();
			setProfileBody(doc, {
				[key]: [
					organizationShape,
					{ type: "object", properties: { profile: { type: "string" } } },
				],
			});

			const overlaid = await applyCompatibilityOverlay(doc);

			expect(overrides(overlaid, PROFILE, "put")).toEqual({
				profile: { flagName: "organization-profile" },
			});
		}
	);

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
			"a field missing from every body shape",
			(doc) => {
				setProfileBody(doc, { anyOf: [organizationShape] });
			},
			"field missing",
		],
		[
			"a field retyped in one body shape",
			(doc) => {
				setProfileBody(doc, {
					anyOf: [
						{ type: "object", properties: { profile: { type: "string" } } },
						{ type: "object", properties: { profile: { type: "integer" } } },
					],
				});
			},
			'field type is now "integer"',
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
			"a retyped field wrapped in allOf",
			(doc) => {
				const schemas = doc.components?.["schemas"] as Record<string, object>;
				schemas["precursor_mode"] = { allOf: [{ type: "integer" }] };
			},
			'field type is now "integer"',
		],
		[
			"a field with conflicting allOf types",
			(doc) => {
				const schemas = doc.components?.["schemas"] as Record<string, object>;
				schemas["precursor_mode"] = {
					allOf: [{ type: "string" }, { type: "integer" }],
				};
			},
			"field type is now undefined",
		],
		[
			"an upstream excluded-account flagName",
			(doc) => {
				const op = doc.paths?.[EXCLUDED_RECIPIENT]?.post;
				if (op) {
					op["x-forge-params"] = { account_id: { flagName: "excluded-id" } };
				}
			},
			'upstream now sets x-forge-params["account_id"].flagName',
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
		expect(() => assertCliCompatSource(doc)).toThrow(reason);
		expect(overrides(doc, PRECURSOR, "put")).toBeUndefined();
	});

	it("reports every stale entry in one error", () => {
		const doc = document();
		delete doc.paths?.[PRECURSOR];
		delete doc.paths?.[PROFILE];
		expect(() => assertCliCompatSource(doc)).toThrow(
			[
				"Pinned OpenAPI changed for PUT /zones/{zone_id}/precursor body field `mode` (operation missing); remove or revise its action in generator/cli-compat.overlay.yaml and guard in generator/cli-compat-guards.ts",
				`Pinned OpenAPI changed for PUT ${PROFILE} body field \`profile\` (operation missing); remove or revise its action in generator/cli-compat.overlay.yaml and guard in generator/cli-compat-guards.ts`,
			].join("\n")
		);
	});
});
