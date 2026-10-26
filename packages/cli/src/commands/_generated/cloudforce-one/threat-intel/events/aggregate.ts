import operation from "../../../_operations/cloudforce-one/threat-intel/events/aggregate.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * aggregate command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one threat-intel events aggregate\n\nCounts events grouped by one or more columns, such as `attacker` or `targetIndustry`. Optionally filter by date range and group the counts by day."
		)
		.option("aggregate-by", {
			type: "string",
			description:
				"Column(s) to aggregate by - single column or comma-separated list (e.g., 'attacker', 'targetIndustry', 'attacker,targetIndustry'). With `tags`, an event counts once for each of its tags, in the bucket counts and in `total`, and events without tags count as `Unknown`; `tags` is not supported for analytics datasets.",
			demandOption: true,
		})
		.option("dataset-id", {
			type: "string",
			description:
				"Dataset UUIDs to filter by, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Scope values query at most 50 datasets. If not provided, uses the default dataset.",
		})
		.option("start-date", {
			type: "string",
			description:
				"Start date for filtering (ISO 8601 format, e.g., '2024-01-01')",
		})
		.option("end-date", {
			type: "string",
			description:
				"End date for filtering (ISO 8601 format, e.g., '2024-12-31')",
		})
		.option("group-by-date", {
			type: "boolean",
			description: "Whether to group results by date (daily aggregation)",
		})
		.option("limit", {
			type: "number",
			description: "Maximum number of results to return",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "aggregate",
	describe: "Aggregate events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events aggregate",
				classification: {
					safeFlags: ["group-by-date", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					aggregateBy: argv["aggregate-by"],
					datasetId: argv["dataset-id"],
					startDate: argv["start-date"],
					endDate: argv["end-date"],
					groupByDate: argv["group-by-date"],
					limit: argv["limit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel events aggregate",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/aggregate`,
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
