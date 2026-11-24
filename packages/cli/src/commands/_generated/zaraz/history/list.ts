/**
 * list command
 * @generated from apis/overlays/zaraz.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		offset: {
			kind: "parsed",
			brief:
				"Ordinal number to start listing the results with. Default value is 0.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum amount of results to list. Default value is 10.",
			optional: true,
			parse: Number,
		},
		"sort-field": {
			kind: "enum",
			brief: "The field to sort by. Default is updated_at.",
			values: ["id", "user_id", "description", "created_at", "updated_at"],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sorting order. Default is DESC.",
			values: ["DESC", "ASC"],
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
	describe: "List Zaraz historical configuration records",
	usage:
		"$0 zaraz history list\n\nLists a history of published Zaraz configuration records for a zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
