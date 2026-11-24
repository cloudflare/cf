/**
 * replace command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"grant-trust-to-all-accounts-in-org": {
			kind: "boolean",
			brief:
				"Whether all accounts in the organization are trusted to use this account's cross-account Access resources.",
			optional: true,
		},
		"trusting-accounts": {
			kind: "parsed",
			brief:
				"Explicit account IDs trusted to use this account's cross-account Access resources. At most 100 unique valid account IDs are accepted. Omitted from responses when empty.",
			variadic: true,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "replace",
	describe: "Replace Zero Trust organization trust settings",
	usage:
		"$0 zero-trust organization trust-settings replace\n\nReplaces the trust settings for your Zero Trust organization.",
	...parameters,
	loader: () => import("./replace.handler.js"),
});

export default command;
