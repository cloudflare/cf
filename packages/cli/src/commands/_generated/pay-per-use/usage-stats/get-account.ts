import operation from "../../_operations/pay-per-use/usage-stats/get-account.js";
/**
 * get-account command
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "get-account",
	describe: "Get pay-per-use usage statistics",
	usage:
		"$0 pay-per-use usage-stats get-account\n\nReturns reported usage and the full gross value across all Pay Per Use zones and the publisher of a publisher account or zone over an explicit UTC range of at most 31 days. Usage from every domain and snapshotted price is summed by buyer. Ranges up to and including 7 days use hourly data points; longer ranges use daily data points. Because source data is aggregated hourly, both requested bounds are rounded down to the selected UTC interval and the resolved bounds are returned in the response. The resolved range must contain at least one complete interval. Empty periods are omitted. Buyers and their data points are paginated, while totals cover every buyer in the range. Values are raw usage counts and USD microcents; total_price_usd_microcents is the full value before the publisher revenue share.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		since: {
			kind: "parsed",
			brief:
				"Requested inclusive beginning of the statistics range as an RFC3339 timestamp. Rounded down to the selected UTC interval.",
			parse: String,
		},
		until: {
			kind: "parsed",
			brief:
				"Requested exclusive end of the statistics range as an RFC3339 timestamp. Rounded down to the selected UTC interval. The requested duration from since cannot exceed 31 days.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Results per page.",
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
				command: "pay-per-use usage-stats get-account",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, {
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
