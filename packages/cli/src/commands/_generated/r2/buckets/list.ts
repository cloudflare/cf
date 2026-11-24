/**
 * list command
 * @generated from apis/overlays/r2.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"name-contains": {
			kind: "parsed",
			brief:
				"Bucket names to filter by. Only buckets with this phrase in their name will be returned.",
			optional: true,
			parse: String,
		},
		"start-after": {
			kind: "parsed",
			brief:
				"Bucket name to start searching after. Buckets are ordered lexicographically.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of buckets to return in a single call.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order buckets by.",
			values: ["name"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order buckets.",
			values: ["asc", "desc"],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Pagination cursor received during the last List Buckets call. R2 buckets are paginated using cursors instead of page numbers.",
			optional: true,
			parse: String,
		},
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
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
	describe: "List Buckets",
	usage:
		"$0 r2 buckets list\n\nLists a page of R2 buckets in the account and selected jurisdiction. Use the returned cursor to retrieve the next page.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
