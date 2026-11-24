/**
 * recall command
 * @generated from apis/overlays/agent-memory.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"namespace-name": {
			kind: "parsed",
			brief: "Namespace name.",
			parse: String,
		},
		query: {
			kind: "parsed",
			brief: "Natural-language query to match against stored memories.",
			optional: true,
			parse: String,
		},
		"reference-date": {
			kind: "parsed",
			brief: "Temporal anchor for relative date references in the query.",
			optional: true,
			parse: String,
		},
		"response-length": {
			kind: "parsed",
			brief: "Verbosity of the synthesized answer. Defaults to 'medium'.",
			optional: true,
			choices: ["short", "medium", "long"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "response-length", "text"),
		},
		"thinking-level": {
			kind: "parsed",
			brief: "Recall intensity / search depth. Defaults to 'low'.",
			optional: true,
			choices: ["low", "medium", "high"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "thinking-level", "text"),
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
		{ placeholder: "profile-name", brief: "Profile name.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "recall <profile-name>",
	describe: "Recall memories",
	usage:
		"$0 agent-memory recall <profile-name>\n\nRetrieves memories relevant to the query and returns a synthesized answer.",
	...parameters,
	loader: () => import("./recall.handler.js"),
});

export default command;
