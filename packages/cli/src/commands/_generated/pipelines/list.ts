/**
 * list command
 * @generated from apis/overlays/pipelines.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "Filters pipelines by name (case-insensitive substring).",
			optional: true,
			parse: String,
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
	describe: "List Pipelines",
	usage: "$0 pipelines list\n\nList/Filter Pipelines in Account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
