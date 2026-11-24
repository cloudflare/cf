/**
 * query command
 * @generated from apis/overlays/billing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"filter-by-billable-metric-ids": {
			kind: "parsed",
			brief:
				"Restrict results to rows whose `x_BillableMetricId` matches one of these billable metric ids (e.g. `workers_standard_requests`). Values must be unique. Cost billed under an archived billable metric carries that metric's catalog public id as `x_BillableMetricId` and is never matched by this filter; omit the filter to include it.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filter-by-product-family-ids": {
			kind: "parsed",
			brief:
				"Restrict results to billable metrics belonging to these product families. Values must be unique UUIDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filter-by-tags": {
			kind: "parsed",
			brief:
				'Restrict results by resource tags. Filters for different keys are combined with AND, while values within one filter are combined with OR. Keys must be unique and are case-sensitive. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"Key": string, "Values": [string]}].',
			optional: true,
			parse: String,
		},
		granularity: {
			kind: "parsed",
			brief:
				"Optional time bucket to sum records over. `DAILY` returns one record per day. `PERIOD` returns one record for the whole time period. When set with `Metric` `cost`, cost is summed across pricing tiers into one record per billable metric per bucket. When omitted, records are not summed: `usage` returns daily records and `cost` returns one record per rated breakdown. Available only on `POST` account usage.",
			optional: true,
			choices: ["DAILY", "PERIOD"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "granularity", "text"),
		},
		"group-by": {
			kind: "parsed",
			brief:
				'Grouping definitions used to split result rows. At most two unique keys may be supplied. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"Key": string, "Type": "TAG" | "DIMENSION"}].',
			optional: true,
			parse: String,
		},
		metric: {
			kind: "parsed",
			brief:
				"Type of cost/usage records to retrieve. `usage` returns unrated usage quantities. `cost` returns rated usage with cost and pricing fields; it is available only on `POST` account usage and only when the underlying usage data source is ClickHouse (other sources return an empty result set). Requests that combine `cost` with `GroupBy` or `FilterBy.Tags` return HTTP 400. Unrelated to `FilterBy.BillableMetricIds`. Defaults to `usage` when omitted.",
			default: "usage",
			choices: ["usage", "cost"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "metric", "text"),
		},
		"time-period-from": {
			kind: "parsed",
			brief: "Start of the range (ISO 8601). Required if `To` is set.",
			optional: true,
			parse: String,
		},
		"time-period-to": {
			kind: "parsed",
			brief:
				"End of the range (ISO 8601). Required if `From` is set. Must be after `From` and no more than 31 days after it.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Filter criteria for a usage query. Every field is optional; an empty object is equivalent to omitting the body entirely. Unknown fields are rejected.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "query",
	describe: "Query Account Usage (Version 2, Alpha, Restricted)",
	usage:
		"$0 billing usage query\n\nReturns cost and usage data for a single Cloudflare account, aligned with the [FinOps FOCUS v1.3](https://focus.finops.org/focus-specification/v1-3/) Cost and Usage dataset specification. This is the filterable counterpart to `GET` on the same path. It is a read-only operation and requires only the `#billing:read` permission; `POST` is used so that filter criteria can be supplied in a request body rather than in the query string. Each record represents one billable metric for one account on one day. This includes all metered usage, including usage that falls within free-tier allowances and may result in zero cost. **Note:** Cost and pricing fields are populated only when `Metric` is `cost`; otherwise they are absent from responses. The request body is optional. When it is omitted, or when `TimePeriod` is omitted, the range defaults to the start of the current month through today. The maximum date range is 31 days. Filters of different kinds are combined with AND. Values within one tag filter are combined with OR. Filter values that do not match usage produce an empty result set. Results can be grouped by up to two groups, in any combination of dimension keys and resource-tag keys. Tag groups are returned in the `Tags` field. Usage without a requested tag remains in an untagged group, with that key omitted from `Tags`. Requests that use tag filtering or tag grouping return HTTP 400 when the underlying usage data source does not support tags. Requests that use dimension grouping return HTTP 400 when the underlying usage data source does not support dimensions. `Granularity` is optional. When it is omitted, the response is as described above. With `DAILY`, each record covers one day. With `PERIOD`, each record covers the whole time period: `ChargePeriodStart` is the first day of the period and `ChargePeriodEnd` is the day after its last day. For `usage`, `ConsumedQuantity` is the sum of the daily quantities in the bucket. When `Granularity` is set and `Metric` is `cost`, each record is one billable metric for one bucket. `PricingQuantity` and `BilledCost` are summed across pricing tiers, so unit prices and the list and contracted costs derived from them are absent. Only cost held in US dollars is summed, so a total can be lower than the sum of the `cost` records returned without `Granularity` for the same range when that range also holds cost in another credit type. Requests for `usage` that use `PERIOD` granularity return HTTP 400 when the underlying usage data source does not support it.",
	...parameters,
	loader: () => import("./query.handler.js"),
});

export default command;
