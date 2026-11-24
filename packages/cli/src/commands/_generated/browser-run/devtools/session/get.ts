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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "Session ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <session-id>",
	describe: "Get session details.",
	usage:
		"$0 browser-run devtools session get <session-id>\n\nGet details for a specific browser session.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
