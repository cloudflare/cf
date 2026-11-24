/**
 * update command
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
	describe: "Update rules in bulk",
	usage:
		"$0 magic-network-monitoring rules bulk update\n\nUpdate multiple network monitoring rules for account in a single request. Supports up to 100 rules per request. All rules in a single request must be of the same type.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
