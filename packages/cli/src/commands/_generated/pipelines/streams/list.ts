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
			brief: "Specifies the public ID of the pipeline.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Filters streams by name (case-insensitive substring).",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief: "Sorts streams by this field. Defaults to `created_at`.",
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
	describe: "List Streams",
	usage: "$0 pipelines streams list\n\nList/Filter Streams in Account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
