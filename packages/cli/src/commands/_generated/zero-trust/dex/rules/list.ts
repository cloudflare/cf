/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			parse: Number,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort direction for sort_by property.",
			values: ["ASC", "DESC"],
			optional: true,
		},
		"sort-by": {
			kind: "enum",
			brief: "Which property to sort results by.",
			values: ["name", "created_at", "updated_at"],
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Filter results by rule name.",
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
	describe: "List DEX Rules",
	usage: "$0 zero-trust dex rules list\n\nList DEX Rules.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
