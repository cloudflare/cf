/**
 * update command
 * @generated from apis/overlays/ai-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		topics: {
			kind: "parsed",
			brief:
				'Custom topic categories for AI Security for Apps content detection. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"label": string, "topic": string}].',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "update",
	describe: "Update the AI Security for Apps custom topics of a zone.",
	usage:
		"$0 ai-security custom-topics update\n\nUpdate the custom topic list of the zone, overwriting it entirely with the topics in the request, so include every topic you want to keep. Changes can take up to a minute to propagate. Each entry has a `label`, used to reference the topic in rule expressions and analytics, and a `topic` description, which the classifier scores prompts against while AI Security for Apps is enabled. The following rules apply: - A zone can hold at most 20 topics. - `label` must be 2–20 characters, using only lowercase letters (a–z), digits (0–9), and hyphens. - `topic` must be 2–50 UTF-8 bytes. Text in any language is supported, including spaces, numbers, punctuation, and symbols. Tabs, line breaks, invalid text, and invisible formatting characters are not allowed. - Labels must be unique within the zone, and so must topic descriptions.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
