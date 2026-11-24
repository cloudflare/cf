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
		"expires-in-ms": {
			kind: "parsed",
			brief:
				"How long the live view URLs remain valid, in milliseconds. Default: 5 minutes. Max: 60 minutes.",
			default: "300000",
			parse: Number,
		},
		"guardrails-mode": {
			kind: "parsed",
			brief: "The guardrails.mode field",
			optional: true,
			choices: ["readonly"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "guardrails-mode", "text"),
		},
		"view-mode": {
			kind: "parsed",
			brief:
				"UI mode: 'devtools' (Chrome DevTools), 'tab' (single tab view), 'full' (multi-tab browser)",
			default: "devtools",
			choices: ["devtools", "tab", "full"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "view-mode", "text"),
		},
		"target-id": {
			kind: "parsed",
			brief:
				"Target ID (page) to connect to. If omitted, auto-resolves to the first active page.",
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
	operands: [
		{ placeholder: "session-id", brief: "Browser session ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <session-id>",
	describe: "Mint live view URLs for a browser session",
	usage:
		"$0 browser-run devtools browser live-view create <session-id>\n\nGenerates time-limited URLs to view a remote browser session. Set `guardrails: { mode: 'readonly' }` to create a view-only link.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
