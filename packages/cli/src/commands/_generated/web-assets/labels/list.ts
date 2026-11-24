/**
 * list command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order by",
			values: [
				"name",
				"description",
				"created_at",
				"last_updated",
				"mapped_resources.operations",
			],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		source: {
			kind: "enum",
			brief: "Filter for labels with source",
			values: ["user", "managed"],
			optional: true,
		},
		filter: {
			kind: "parsed",
			brief:
				"Filter for labels where the name or description matches using substring match",
			optional: true,
			parse: String,
		},
		"with-mapped-resource-counts": {
			kind: "boolean",
			brief: "Include `mapped_resources` for each label",
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
	describe: "List operation labels",
	usage:
		"$0 web-assets labels list\n\nReturns all managed and user-defined labels available for web and API operations in the zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
