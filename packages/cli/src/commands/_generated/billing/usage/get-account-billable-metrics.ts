import operation from "../../_operations/billing/usage/get-account-billable-metrics.js";
/**
 * get-account-billable-metrics command
 * @generated from apis/overlays/billing.ts
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
	command: "get-account-billable-metrics",
	describe: "List Account Billable Metrics (Version 2, Alpha, Restricted)",
	usage:
		"$0 billing usage get-account-billable-metrics\n\nLists billable metrics available to the account through contracts and subscriptions that overlap the requested period. Results are deduplicated and ordered. If no qualifying contract exists, the result is an empty array. When `from` and `to` are omitted, the period defaults to the start of the current month through today. The maximum date range is 31 days.",
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Start date for the usage query (ISO 8601). Required if `to` is set. When omitted along with `to`, defaults to the start of the current month. Filters by charge period (when consumption happened), not billing period. The maximum date range is 31 days.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"End date for the usage query (ISO 8601). Required if `from` is set. When omitted along with `from`, defaults to today. Filters by charge period (when consumption happened), not billing period. The maximum date range is 31 days.",
			optional: true,
			parse: String,
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
				command: "billing usage get-account-billable-metrics",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					from: argv["from"],
					to: argv["to"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing usage get-account-billable-metrics",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billable/usage/billable-metrics`,
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
