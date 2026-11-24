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
		"pipeline-id": {
			kind: "parsed",
			brief: "Pipeline ID",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Filters sinks by name (case-insensitive substring).",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief: "Sorts sinks by this field. Defaults to `created_at`.",
			values: ["name", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Sort direction.",
			values: ["asc", "desc"],
			optional: true,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Sinks",
	usage: "$0 pipelines sinks list\n\nList/Filter Sinks in Account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
