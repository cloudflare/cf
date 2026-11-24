/**
 * create command
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
		"keep-alive": {
			kind: "parsed",
			brief: "Keep-alive time in milliseconds",
			optional: true,
			parse: Number,
		},
		lab: {
			kind: "boolean",
			brief: "Use experimental browser.",
			optional: true,
		},
		recording: {
			kind: "boolean",
			brief:
				"Record the browser session. Retrieve it with `GET /recording/:session_id`.",
			optional: true,
		},
		browser: {
			kind: "enum",
			brief:
				"Rendering backend for this script. Set to `kitesurf` to run it on Kitesurf (beta), which supports CDP only and rejects `keep_alive`, `lab` and `recording`.",
			values: ["kitesurf"],
			optional: true,
		},
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Dynamic Script - execute code and return browser session details.",
	usage:
		"$0 browser-run script create\n\nAcquires a browser session and runs the provided code in it. The session stays open for reuse; close it with `DELETE /devtools/browser/:sessionId` or `browser.close()`, otherwise it ends at the idle timeout.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
