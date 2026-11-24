import operation from "../../../_operations/cloudforce-one/threat-intel/events/aggregate.js";
/**
 * aggregate command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "aggregate",
	describe: "Aggregate events",
	usage:
		"$0 cloudforce-one threat-intel events aggregate\n\nCounts events grouped by one or more columns, such as `attacker` or `targetIndustry`. Optionally filter by date range and group the counts by day.",
	flags: {
		"aggregate-by": {
			kind: "parsed",
			brief:
				"Column(s) to aggregate by - single column or comma-separated list (e.g., 'attacker', 'targetIndustry', 'attacker,targetIndustry'). With `tags`, an event counts once for each of its tags, in the bucket counts and in `total`, and events without tags count as `Unknown`; `tags` is not supported for analytics datasets.",
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief:
				"Dataset UUIDs to filter by, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Scope values query at most 50 datasets. If not provided, uses the default dataset.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"start-date": {
			kind: "parsed",
			brief: "Start date for filtering (ISO 8601 format, e.g., '2024-01-01')",
			optional: true,
			parse: String,
		},
		"end-date": {
			kind: "parsed",
			brief: "End date for filtering (ISO 8601 format, e.g., '2024-12-31')",
			optional: true,
			parse: String,
		},
		"group-by-date": {
			kind: "boolean",
			brief: "Whether to group results by date (daily aggregation)",
			optional: true,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of results to return",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events aggregate",
				classification: {
					safeFlags: ["group-by-date", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
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
});

export default command;
