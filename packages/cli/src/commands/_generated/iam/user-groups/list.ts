/**
 * list command
 * @generated from apis/overlays/iam.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: {
			kind: "parsed",
			brief: "ID of the user group to be fetched.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the user group to be fetched.",
			optional: true,
			parse: String,
		},
		"fuzzy-name": {
			kind: "parsed",
			brief:
				"A string used for searching for user groups containing that substring.",
			optional: true,
			parse: String,
		},
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
		direction: {
			kind: "enum",
			brief:
				"The sort order of returned user groups by name (ascending or descending).",
			values: ["asc", "desc"],
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
	describe: "List User Groups",
	usage: "$0 iam user-groups list\n\nList all the user groups for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
