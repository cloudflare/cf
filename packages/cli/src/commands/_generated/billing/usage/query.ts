import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * query command
 * @generated from apis/overlays/billing.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 billing usage query\n\nReturns cost and usage data for a single Cloudflare account, aligned with the [FinOps FOCUS v1.3](https://focus.finops.org/focus-specification/v1-3/) Cost and Usage dataset specification. This is the filterable counterpart to `GET` on the same path. It is a read-only operation and requires only the `#billing:read` permission; `POST` is used so that filter criteria can be supplied in a request body rather than in the query string. Each record represents one billable metric for one account on one day. This includes all metered usage, including usage that falls within free-tier allowances and may result in zero cost. **Note:** Cost and pricing fields are populated only when `Metric` is `cost`; otherwise they are absent from responses. The request body is optional. When it is omitted, or when `TimePeriod` is omitted, the range defaults to the start of the current month through today. The maximum date range is 31 days. Filters of different kinds are combined with AND. Values within one tag filter are combined with OR. Filter values that do not match usage produce an empty result set. Results can be grouped by up to two groups, in any combination of dimension keys and resource-tag keys. Tag groups are returned in the `Tags` field. Usage without a requested tag remains in an untagged group, with that key omitted from `Tags`. Requests that use tag filtering or tag grouping return HTTP 400 when the underlying usage data source does not support tags. Requests that use dimension grouping return HTTP 400 when the underlying usage data source does not support dimensions."
		)
		.option("filter-by-billable-metric-ids", {
			type: "string",
			array: true,
			description:
				"Restrict results to rows whose `x_BillableMetricId` matches one of these billable metric ids (e.g. `workers_standard_requests`). Values must be unique.",
		})
		.option("filter-by-product-family-ids", {
			type: "string",
			array: true,
			description:
				"Restrict results to billable metrics belonging to these product families. Values must be unique UUIDs.",
		})
		.option("group-by", {
			type: "string",
			description:
				"Grouping definitions used to split result rows. At most two unique keys may be supplied. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("metric", {
			type: "string",
			description:
				"Type of cost/usage records to retrieve. `usage` returns unrated usage quantities. `cost` returns rated usage with cost and pricing fields; it is available only on `POST` account usage and only when the underlying usage data source is ClickHouse (other sources return an empty result set). Requests that combine `cost` with `GroupBy` or `FilterBy.Tags` return HTTP 400. Unrelated to `FilterBy.BillableMetricIds`. Defaults to `usage` when omitted.",
			choices: ["usage", "cost"],
			default: "usage",
		})
		.coerce("metric", (value) => resolveFileToken(value, "metric", "text"))
		.option("time-period-from", {
			type: "string",
			description: "Start of the range (ISO 8601). Required if `To` is set.",
		})
		.option("time-period-to", {
			type: "string",
			description:
				"End of the range (ISO 8601). Required if `From` is set. Must be after `From` and no more than 31 days after it.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Filter criteria for a usage query. Every field is optional; an empty object is equivalent to omitting the body entirely. Unknown fields are rejected.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"billable-usage-v2-query-account-usage">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "query",
	describe: "Query Account Usage (Version 2, Alpha, Restricted)",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing usage query",
				classification: {
					safeFlags: ["metric", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing usage query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billable/usage`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										FilterBy: {
											BillableMetricIds: argv["filter-by-billable-metric-ids"],
											ProductFamilyIds: argv["filter-by-product-family-ids"],
										},
										GroupBy: parseObjectArray(argv["group-by"], "group-by"),
										Metric: argv["metric"],
										TimePeriod: {
											From: resolveFileToken(
												argv["time-period-from"] as string | undefined,
												"time-period-from",
												"text"
											),
											To: resolveFileToken(
												argv["time-period-to"] as string | undefined,
												"time-period-to",
												"text"
											),
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Loading`, async () =>
						client.billing.usage.query({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					FilterBy: {
						BillableMetricIds: argv["filter-by-billable-metric-ids"],
						ProductFamilyIds: argv["filter-by-product-family-ids"],
					},
					GroupBy: parseObjectArray(argv["group-by"], "group-by"),
					Metric: argv["metric"],
					TimePeriod: {
						From: resolveFileToken(
							argv["time-period-from"] as string | undefined,
							"time-period-from",
							"text"
						),
						To: resolveFileToken(
							argv["time-period-to"] as string | undefined,
							"time-period-to",
							"text"
						),
					},
				});
				const result = await withProgress(`Loading`, async () =>
					client.billing.usage.query({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
