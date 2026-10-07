import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get-account command
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
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
			"$0 pay-per-use usage-stats get-account\n\nReturns reported usage and the full gross value across all Pay Per Use zones in a publisher account or zone over an explicit UTC range of at most 31 days. Usage from every domain and snapshotted price is summed by buyer. Ranges up to and including 7 days use hourly data points; longer ranges use daily data points. Because source data is aggregated hourly, both requested bounds are rounded down to the selected UTC interval and the resolved bounds are returned in the response. The resolved range must contain at least one complete interval. Empty periods are omitted. Buyers and their data points are paginated, while totals cover every buyer in the range. Values are raw usage counts and USD microcents; total_price_usd_microcents is the full value before the publisher revenue share."
		)
		.option("since", {
			type: "string",
			description:
				"Requested inclusive beginning of the statistics range as an RFC3339 timestamp. Rounded down to the selected UTC interval.",
			demandOption: true,
		})
		.option("until", {
			type: "string",
			description:
				"Requested exclusive end of the statistics range as an RFC3339 timestamp. Rounded down to the selected UTC interval. The requested duration from since cannot exceed 31 days.",
			demandOption: true,
		})
		.option("page", { type: "number", description: "Page number." })
		.option("per-page", { type: "number", description: "Results per page." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:get:/{account_or_zone}/{account_or_zone_id}/pay-per-use/usage-stats">;
type Query =
	SdkQuery<"generated:get:/{account_or_zone}/{account_or_zone_id}/pay-per-use/usage-stats">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get-account",
	describe: "Get pay-per-use usage statistics",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-use usage-stats get-account",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					since: argv["since"],
					until: argv["until"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf pay-per-use usage-stats get-account",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/pay-per-use/usage-stats`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				const result = await withProgress(`Loading`, async () =>
					client.payPerUse.usageStats.getAccount({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
