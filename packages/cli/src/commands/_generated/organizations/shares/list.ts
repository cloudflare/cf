/**
 * list command
 * @generated from apis/overlays/organizations.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "Organization identifier.",
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter shares by status.",
			values: ["active", "deleting", "deleted"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Order shares by values in the given field.",
			values: ["name", "created"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to sort objects.",
			values: ["asc", "desc"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number. Defaults to `1` when omitted.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of objects to return per page. Defaults to `20` when omitted.",
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
	describe: "List organization shares",
	usage: "$0 organizations shares list\n\nLists all organization shares.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
