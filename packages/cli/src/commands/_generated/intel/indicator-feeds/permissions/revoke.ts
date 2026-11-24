/**
 * revoke command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"account-tag": {
			kind: "parsed",
			brief:
				"The Cloudflare account tag of the account to change permissions on",
			optional: true,
			parse: String,
		},
		"feed-id": {
			kind: "parsed",
			brief: "The ID of the feed to add/remove permissions on",
			optional: true,
			parse: Number,
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
	describe: "Revoke permission to indicator feed",
	usage:
		"$0 intel indicator-feeds permissions revoke\n\nRevokes access permissions for a custom threat indicator feed.",
	...parameters,
	loader: () => import("./revoke.handler.js"),
});

export default command;
