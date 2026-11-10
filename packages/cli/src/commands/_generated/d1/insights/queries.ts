import operation from "../../_operations/d1/insights/queries.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * queries command
 * @generated from apis/overlays/d1.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 d1 insights queries\n\nList the SQL statements with the highest usage in a time window, across all databases in your account or for one database, sorted by `order_by` from highest to lowest. Each item is one query text in one database. The same text run in two databases is two items. Values are estimates computed from sampled per-statement data. They include statements that failed with a SQL error, and deleted databases. They do not include imports and exports, so they can be lower than the totals from `GET /accounts/{account_id}/d1/insights/databases`, billing, and the GraphQL Analytics API. Usage is available a few minutes after a query completes. For more complex filtering, or other metrics, groupings or time windows, run your own SQL on the `events.d1Queries` dataset with `cf sql query`. For examples, see https://developers.cloudflare.com/d1/observability/find-expensive-queries/"
		)
		.option("order-by", {
			type: "string",
			description:
				"The usage metric to sort by, from highest to lowest. `duration` sorts by `total_duration_ms`.",
			choices: ["rows_read", "duration", "executions"],
		})
		.option("database-id", {
			type: "string",
			description:
				"Only return queries for this database. Defaults to all databases in the account. A database with no usage in the window, or that is not in the account, returns an empty list.",
		})
		.option("since", {
			type: "string",
			description:
				"Start of the window (inclusive), in RFC 3339 format. Defaults to 24 hours before `until`. Must be before `until`, and at most 90 days ago. The window from `since` to `until` must be at most 7 days.",
		})
		.option("until", {
			type: "string",
			description:
				"End of the window (exclusive), in RFC 3339 format. Defaults to the current time.",
		})
		.option("limit", {
			type: "number",
			description:
				"Maximum number of queries to return. Results are not paginated, so only the top `limit` queries are returned.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "queries",
	describe: "List Top D1 Queries",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 insights queries",
				classification: {
					safeFlags: ["order-by", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					order_by: argv["order-by"],
					database_id: argv["database-id"],
					since: argv["since"],
					until: argv["until"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 insights queries",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/insights/queries`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
