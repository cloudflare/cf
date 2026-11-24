/**
 * update command
 * @generated from apis/overlays/security-insights.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"scans-enabled": {
			kind: "boolean",
			brief: "Enable or disable scans for the account.",
			optional: true,
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
	command: "update",
	describe: "Updates Account State",
	usage:
		"$0 security-insights state update\n\nUpdates account-level Security Center state. Currently supports enabling or disabling scans for the account. Returns the account's state after the update.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
