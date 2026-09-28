import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
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
			"$0 cloudforce-one events aggregate get\n\nAggregate threat events by one or more columns (e.g., attacker, targetIndustry) with optional date filtering and daily grouping. Supports multi-dimensional aggregation for cross-analysis."
		)
		.option("aggregate-by", {
			type: "string",
			description:
				"Column(s) to aggregate by - single column or comma-separated list (e.g., 'attacker', 'targetIndustry', 'attacker,targetIndustry')",
			demandOption: true,
		})
		.option("dataset-id", {
			type: "string",
			description:
				"Dataset UUIDs to filter by, or one standalone scope value: 'all'/'*' for all accessible non-analytics event datasets (analytics datasets are silently excluded), 'analytics' for isAnalytics=true datasets, or 'operational' for isAnalytics=false datasets. If not provided, uses the default dataset.",
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

type Request = SdkRequest<"get_EventAggregate">;
type Query = SdkQuery<"get_EventAggregate">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe:
		"Aggregate events by single or multiple columns with optional date filtering",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events aggregate get",
				classification: {
					safeFlags: ["group-by-date", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
						command: "cf cloudforce-one events aggregate get",
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
					client.cloudforceOne.events.aggregate.get({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
