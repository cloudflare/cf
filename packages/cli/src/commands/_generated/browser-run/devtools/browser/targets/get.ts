/**
 * get command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"session-id": {
			kind: "parsed",
			brief: "Browser session ID.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "target-id", brief: "Target ID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <target-id>",
	describe: "Get a target by ID.",
	usage:
		"$0 browser-run devtools browser targets get <target-id>\n\nReturns the debuggable target with the given ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
