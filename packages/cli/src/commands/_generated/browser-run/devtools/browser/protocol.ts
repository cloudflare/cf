/**
 * protocol command
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
		{ placeholder: "session-id", brief: "Browser session ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "protocol <session-id>",
	describe: "Get Chrome DevTools Protocol schema.",
	usage:
		"$0 browser-run devtools browser protocol <session-id>\n\nReturns the complete Chrome DevTools Protocol schema including all domains, commands, events, and types. This schema describes the entire CDP API surface.",
	...parameters,
	loader: () => import("./protocol.handler.js"),
});

export default command;
