/**
 * list command
 * @generated from apis/overlays/workflows.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"workflow-name": { kind: "parsed", brief: "Workflow name", parse: String },
		page: {
			kind: "parsed",
			brief: "Deprecated: use `cursor` for pagination instead.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token for cursor-based pagination. Mutually exclusive with `page`.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Defines the direction for cursor-based pagination.",
			values: ["asc", "desc"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "Status",
			values: [
				"queued",
				"running",
				"paused",
				"errored",
				"terminated",
				"complete",
				"waitingForPause",
				"waiting",
				"rollingBack",
			],
			optional: true,
		},
		start: {
			kind: "parsed",
			brief: "Accepts ISO 8601 with no timezone offsets and in UTC.",
			optional: true,
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "Accepts ISO 8601 with no timezone offsets and in UTC.",
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
	describe: "List of workflow instances",
	usage:
		"$0 workflows instances list\n\nLists all instances of a workflow with their execution status.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
