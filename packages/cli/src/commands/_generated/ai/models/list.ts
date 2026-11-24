/**
 * list command
 * @generated from apis/overlays/ai.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		task: {
			kind: "parsed",
			brief: "Filter by Task Name.",
			optional: true,
			parse: String,
		},
		author: {
			kind: "parsed",
			brief: "Filter by Author.",
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief: "Filter by Source Id.",
			optional: true,
			parse: Number,
		},
		"hide-experimental": {
			kind: "boolean",
			brief: "Filter to hide experimental models.",
			optional: true,
		},
		search: { kind: "parsed", brief: "Search.", optional: true, parse: String },
		"include-deprecated": {
			kind: "boolean",
			brief:
				"If true, include models for up to three months after their deprecation date. Defaults to false.",
			optional: true,
		},
		format: {
			kind: "enum",
			brief:
				"If set, return models in the requested marketplace format instead of the default response.",
			values: ["openrouter"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "Model Search",
	usage:
		"$0 ai models list\n\nSearches Workers AI models by name or description.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
