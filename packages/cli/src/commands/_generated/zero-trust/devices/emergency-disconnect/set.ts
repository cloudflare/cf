/**
 * set command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		disconnect: {
			kind: "boolean",
			brief:
				"Disconnects all devices on the account using Global WARP override.",
			optional: true,
		},
		justification: {
			kind: "parsed",
			brief:
				"Reasoning for setting the Global WARP override state. This will be surfaced in the audit log.",
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
	command: "set",
	describe: "Set Global Disconnect",
	usage:
		"$0 zero-trust devices emergency-disconnect set\n\nSets the Global WARP disconnect state.",
	...parameters,
	loader: () => import("./set.handler.js"),
});

export default command;
