/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"integration-config-api-url": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- The Workspace One API URL provided in the Workspace One Admin Dashboard.\n- The Crowdstrike API URL.\n- The Uptycs API URL.\n- The Tanium API URL.\n- The SentinelOne S2S API URL.\n- The Custom Device Posture Integration  API URL.",
			optional: true,
			parse: String,
		},
		"integration-config-auth-url": {
			kind: "parsed",
			brief: "The Workspace One Authorization URL depending on your region.",
			optional: true,
			parse: String,
		},
		"integration-config-client-id": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- The Workspace One client ID provided in the Workspace One Admin Dashboard.\n- The Crowdstrike client ID.\n- The Intune client ID.\n- The Kolide client ID.",
			optional: true,
			parse: String,
		},
		"integration-config-client-secret": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- The Workspace One client secret provided in the Workspace One Admin Dashboard.\n- The Crowdstrike client secret.\n- The Uptycs client secret.\n- The Intune client secret.\n- The Kolide client secret.\n- The Tanium client secret.\n- The SentinelOne S2S client secret.",
			optional: true,
			parse: String,
		},
		"integration-config-customer-id": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- The Crowdstrike customer ID.\n- The Uptycs customer ID.\n- The Intune customer ID.",
			optional: true,
			parse: String,
		},
		"integration-config-client-key": {
			kind: "parsed",
			brief: "The Uptycs client secret.",
			optional: true,
			parse: String,
		},
		"integration-config-access-client-id": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- If present, this id will be passed in the `CF-Access-Client-ID` header when hitting the `api_url`.\n- This id will be passed in the `CF-Access-Client-ID` header when hitting the `api_url`.",
			optional: true,
			parse: String,
		},
		"integration-config-access-client-secret": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- If present, this secret will be passed in the `CF-Access-Client-Secret` header when hitting the `api_url`.\n- This secret will be passed in the `CF-Access-Client-Secret` header when hitting the `api_url`.",
			optional: true,
			parse: String,
		},
		interval: {
			kind: "parsed",
			brief:
				"The interval between each posture check with the third-party API. Use `m` for minutes (e.g. `5m`) and `h` for hours (e.g. `12h`).",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the device posture integration.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The type of device posture integration.",
			optional: true,
			choices: [
				"workspace_one",
				"crowdstrike_s2s",
				"uptycs",
				"intune",
				"kolide",
				"tanium_s2s",
				"sentinelone_s2s",
				"custom_s2s",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "integration-id", brief: "API UUID.", parse: String },
	],
	rules(rules) {
		rules.conflicts("integration-config-auth-url", [
			"integration-config-customer-id",
			"integration-config-client-key",
			"integration-config-access-client-id",
			"integration-config-access-client-secret",
		]);
		rules.implies("integration-config-auth-url", [
			"integration-config-api-url",
			"integration-config-client-id",
			"integration-config-client-secret",
		]);
		rules.conflicts("integration-config-client-id", [
			"integration-config-client-key",
			"integration-config-access-client-id",
			"integration-config-access-client-secret",
		]);
		rules.implies("integration-config-client-id", [
			"integration-config-client-secret",
		]);
		rules.conflicts("integration-config-customer-id", [
			"integration-config-auth-url",
			"integration-config-access-client-id",
			"integration-config-access-client-secret",
		]);
		rules.implies("integration-config-customer-id", [
			"integration-config-client-secret",
		]);
		rules.conflicts("integration-config-client-key", [
			"integration-config-auth-url",
			"integration-config-client-id",
			"integration-config-access-client-id",
			"integration-config-access-client-secret",
		]);
		rules.implies("integration-config-client-key", [
			"integration-config-api-url",
			"integration-config-client-secret",
			"integration-config-customer-id",
		]);
		rules.conflicts("integration-config-access-client-id", [
			"integration-config-auth-url",
			"integration-config-client-id",
			"integration-config-customer-id",
			"integration-config-client-key",
		]);
		rules.implies("integration-config-access-client-id", [
			"integration-config-api-url",
		]);
		rules.conflicts("integration-config-access-client-secret", [
			"integration-config-auth-url",
			"integration-config-client-id",
			"integration-config-customer-id",
			"integration-config-client-key",
		]);
		rules.implies("integration-config-access-client-secret", [
			"integration-config-api-url",
		]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <integration-id>",
	describe: "Update posture integration",
	usage:
		"$0 zero-trust devices posture integrations update <integration-id>\n\nUpdates a configured device posture integration.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
