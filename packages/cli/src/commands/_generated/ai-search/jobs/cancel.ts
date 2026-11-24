/**
 * cancel command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
		"instance-id": {
			kind: "parsed",
			brief: "AI Search instance ID.",
			parse: String,
		},
		action: {
			kind: "parsed",
			brief: "The action field",
			optional: true,
			choices: ["cancel"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
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
	operands: [
		{ placeholder: "job-id", brief: "Indexing job ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "cancel <job-id>",
	describe: "Cancel an indexing job.",
	usage:
		"$0 ai-search jobs cancel <job-id>\n\nCancels an in-progress indexing job for an AI Search instance.",
	...parameters,
	loader: () => import("./cancel.handler.js"),
});

export default command;
