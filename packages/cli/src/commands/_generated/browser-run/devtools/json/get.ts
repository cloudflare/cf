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
		"live-view-url-expires-in-ms": {
			kind: "parsed",
			brief:
				"How long the live view URLs remain valid, in milliseconds (max 60 minutes)",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "Browser session ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <session-id>",
	describe: "List targets.",
	usage:
		"$0 browser-run devtools json get <session-id>\n\nReturns a list of all debuggable targets including tabs, pages, service workers, and other browser contexts.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
