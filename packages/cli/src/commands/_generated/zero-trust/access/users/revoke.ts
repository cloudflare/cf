/**
 * revoke command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		devices: {
			kind: "boolean",
			brief:
				"When set to `true`, all devices associated with the user will be revoked.",
			optional: true,
		},
		email: {
			kind: "parsed",
			brief: "The email of the user to revoke.",
			optional: true,
			parse: String,
		},
		"user-uid": {
			kind: "parsed",
			brief: "The uuid of the user to revoke.",
			optional: true,
			parse: String,
		},
		"warp-session-reauth": {
			kind: "boolean",
			brief:
				"When set to `true`, the user will be required to re-authenticate to WARP for all Gateway policies that enforce a WARP client session duration. When `false`, the user’s WARP session will remain active",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "revoke",
	describe: "Revoke all Access tokens for a user",
	usage:
		"$0 zero-trust access users revoke\n\nRevokes a user's access across all applications.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./revoke.handler.js"),
});

export default command;
