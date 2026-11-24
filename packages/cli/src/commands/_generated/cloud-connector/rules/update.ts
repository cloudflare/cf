/**
 * update command
 * @generated from apis/overlays/cloud-connector.ts
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
	describe: "Put Rules",
	usage:
		"$0 cloud-connector rules update\n\nUpdates Cloud Connector rules for a zone, replacing the existing rule configuration.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
