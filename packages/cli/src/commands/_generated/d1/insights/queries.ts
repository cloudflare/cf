/**
 * queries command
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
			brief:
				"The usage metric to sort by, from highest to lowest. `duration` sorts by `total_duration_ms`.",
			values: ["rows_read", "duration", "executions"],
			optional: true,
		},
		"database-id": {
			kind: "parsed",
			brief:
				"Only return queries for this database. Defaults to all databases in the account. A database with no usage in the window, or that is not in the account, returns an empty list.",
			optional: true,
			parse: String,
		},
		since: {
			kind: "parsed",
			brief:
				"Start of the window (inclusive), in RFC 3339 format. Defaults to 24 hours before `until`. Must be before `until`, and at most 90 days ago. The window from `since` to `until` must be at most 7 days.",
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
				"Maximum number of queries to return. Results are not paginated, so only the top `limit` queries are returned.",
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
	command: "queries",
	describe: "List Top D1 Queries",
	usage:
		"$0 d1 insights queries\n\nList the SQL statements with the highest usage in a time window, across all databases in your account or for one database, sorted by `order_by` from highest to lowest. Each item is one query text in one database. The same text run in two databases is two items. Values are estimates computed from sampled per-statement data. They include statements that failed with a SQL error, and deleted databases. They do not include imports and exports, so they can be lower than the totals from `GET /accounts/{account_id}/d1/insights/databases`, billing, and the GraphQL Analytics API. Usage is available a few minutes after a query completes. For more complex filtering, or other metrics, groupings or time windows, run your own SQL on the `events.d1Queries` dataset with `cf sql query`. For examples, see https://developers.cloudflare.com/d1/observability/find-expensive-queries/",
	...parameters,
	loader: () => import("./queries.handler.js"),
});

export default command;
