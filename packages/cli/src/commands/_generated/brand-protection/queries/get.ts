/**
 * get command
 * @generated from apis/overlays/brand-protection.ts
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
			brief:
				"ID of a domain query. When set, `result` is that single query object instead of an array, and `page` and `per_page` are ignored.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				"Page number for paginated list requests. Defaults to 1 when only per_page is supplied. Omit page and per_page to return every query.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of queries per page for paginated list requests. Defaults to 100 when only page is supplied. Maximum 100. Omit page and per_page to return every query.",
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
	command: "get",
	describe: "List domain queries",
	usage:
		"$0 brand-protection queries get\n\nLists the account's saved domain queries, most recently updated first. Set `id` to return a single query object instead of an array. Set `page` or `per_page` to paginate the list; the response then includes `result_info`. Without them, every query is returned.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
