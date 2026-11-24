/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		active: {
			kind: "boolean",
			brief:
				"Whether this integration is enabled. If disabled, no risk changes will be exported to the third-party.",
			optional: true,
		},
		"reference-id": {
			kind: "parsed",
			brief:
				"A reference id that can be supplied by the client. Currently this should be set to the Access-Okta IDP ID (a UUIDv4).\nhttps://developers.cloudflare.com/api/operations/access-identity-providers-get-an-access-identity-provider",
			optional: true,
			parse: String,
		},
		"tenant-url": {
			kind: "parsed",
			brief: 'The base url of the tenant, e.g. "https://tenant.okta.com".',
			optional: true,
			parse: String,
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
		{ placeholder: "integration-id", brief: "Integration ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <integration-id>",
	describe: "Update a risk score integration.",
	usage:
		"$0 zero-trust risk-scoring integrations update <integration-id>\n\nOverwrite the reference_id, tenant_url, and active values with the ones provided.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
