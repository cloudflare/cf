import operation from "../../_operations/d1/insights/databases.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * databases command
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
			"$0 d1 insights databases\n\nList the databases in your account with the highest usage in a time window, sorted by `order_by` from highest to lowest. Totals are computed from the same data as D1 billing and the GraphQL Analytics API. They include every batch in the window: queries, imports and exports, successful and failed. Totals from other insights endpoints that read per-statement data can be lower than these numbers. Deleted databases are included if they had usage in the window. Databases with no usage in the window are not included. Usage is available a few minutes after a batch completes. For more complex filtering, or other metrics, groupings or time windows, run your own SQL on the `events.d1Queries` dataset with `cf sql query`. For examples, see https://developers.cloudflare.com/d1/observability/find-expensive-queries/"
		)
		.option("order-by", {
			type: "string",
			description: "The usage metric to sort by, from highest to lowest.",
			choices: ["rows_read", "rows_written", "queries"],
		})
		.option("database-name", {
			type: "string",
			description:
				"Only count usage from databases whose name contains this value, case-insensitive. Usage recorded before 2026-10-30 has no database name and is not matched.",
		})
		.option("exact", {
			type: "boolean",
			description:
				"If true, `database_name` must match the full database name, case-sensitive.",
		})
		.option("since", {
			type: "string",
			description:
				"Start of the window (inclusive), in RFC 3339 format. Defaults to 24 hours before `until`. Must be before `until`, and at most 90 days ago. The window from `since` to `until` must be at most 31 days.",
		})
		.option("until", {
			type: "string",
			description:
				"End of the window (exclusive), in RFC 3339 format. Defaults to the current time.",
		})
		.option("limit", {
			type: "number",
			description:
				"Maximum number of databases to return. Results are not paginated, so only the top `limit` databases are returned.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "databases",
	describe: "List D1 Databases by Usage",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "d1 insights databases",
				classification: {
					safeFlags: ["order-by", "exact", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					order_by: argv["order-by"],
					database_name: argv["database-name"],
					exact: argv["exact"],
					since: argv["since"],
					until: argv["until"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 insights databases",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/insights/databases`,
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
