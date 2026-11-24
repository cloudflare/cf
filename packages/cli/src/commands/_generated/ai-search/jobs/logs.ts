/**
 * logs command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

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
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
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
		{ placeholder: "job-id", brief: "Indexing job ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "logs <job-id>",
	describe: "List Job Logs",
	usage:
		"$0 ai-search jobs logs <job-id>\n\nLists log entries for an AI Search indexing job.",
	...parameters,
	loader: () => import("./logs.handler.js"),
});

export default command;
