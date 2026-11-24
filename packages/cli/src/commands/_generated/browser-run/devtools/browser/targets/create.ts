/**
 * create command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		url: { kind: "parsed", brief: "Url", optional: true, parse: String },
		"live-view-url-expires-in-ms": {
			kind: "parsed",
			brief:
				"How long the live view URL remains valid, in milliseconds (max 60 minutes)",
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
	command: "create <session-id>",
	describe: "Open a new browser tab.",
	usage:
		"$0 browser-run devtools browser targets create <session-id>\n\nOpens a new tab in the browser. Optionally specify a URL to navigate to.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
