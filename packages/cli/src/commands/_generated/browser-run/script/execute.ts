/**
 * execute command
 * @generated from apis/overlays/browser-run.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		code: {
			kind: "parsed",
			brief: "Function body executed against the selected library's runner.",
			optional: true,
			parse: String,
		},
		library: {
			kind: "parsed",
			brief: "Library the script runs with. Defaults to raw CDP when omitted.",
			optional: true,
			choices: ["playwright", "puppeteer"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "library", "text"),
		},
		"target-id": {
			kind: "parsed",
			brief:
				"Page target the script attaches to. Defaults to the session's first page.",
			optional: true,
			parse: String,
		},
		timeout: {
			kind: "parsed",
			brief: "Maximum script run time in milliseconds.",
			default: "60000",
			parse: Number,
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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{ placeholder: "session-id", brief: "Browser session ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "execute <session-id>",
	describe: "Dynamic Script - execute code in an existing browser session.",
	usage:
		"$0 browser-run script execute <session-id>\n\nRuns the provided code in an existing browser session. The session stays open; close it with `DELETE /devtools/browser/:sessionId` or `browser.close()`, otherwise it ends at the idle timeout.",
	...parameters,
	loader: () => import("./execute.handler.js"),
});

export default command;
