/**
 * databases command
 * @generated from apis/overlays/d1.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"order-by": {
			kind: "enum",
			brief: "The usage metric to sort by, from highest to lowest.",
			values: ["rows_read", "rows_written", "queries"],
			optional: true,
		},
		"database-name": {
			kind: "parsed",
			brief:
				"Only count usage from databases whose name contains this value, case-insensitive. Usage recorded before 2026-10-30 has no database name and is not matched.",
			optional: true,
			parse: String,
		},
		exact: {
			kind: "boolean",
			brief:
				"If true, `database_name` must match the full database name, case-sensitive.",
			optional: true,
		},
		since: {
			kind: "parsed",
			brief:
				"Start of the window (inclusive), in RFC 3339 format. Defaults to 24 hours before `until`. Must be before `until`, and at most 90 days ago. The window from `since` to `until` must be at most 31 days.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief:
				"End of the window (exclusive), in RFC 3339 format. Defaults to the current time.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of databases to return. Results are not paginated, so only the top `limit` databases are returned.",
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
	command: "databases",
	describe: "List D1 Databases by Usage",
	usage:
		"$0 d1 insights databases\n\nList the databases in your account with the highest usage in a time window, sorted by `order_by` from highest to lowest. Totals are computed from the same data as D1 billing and the GraphQL Analytics API. They include every batch in the window: queries, imports and exports, successful and failed. Totals from other insights endpoints that read per-statement data can be lower than these numbers. Deleted databases are included if they had usage in the window. Databases with no usage in the window are not included. Usage is available a few minutes after a batch completes. For more complex filtering, or other metrics, groupings or time windows, run your own SQL on the `events.d1Queries` dataset with `cf sql query`. For examples, see https://developers.cloudflare.com/d1/observability/find-expensive-queries/",
	...parameters,
	loader: () => import("./databases.handler.js"),
});

export default command;
