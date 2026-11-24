import operation from "../../_operations/billing/usage/get-v1.js";
/**
 * get-v1 command
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
	command: "get-v1",
	describe: "Get Account Billable Usage (Version 1, Alpha)",
	usage:
		"$0 billing usage get-v1\n\nReturns billable usage data for the account. When no query parameters are provided, returns usage for the current billing period.",
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Start date for the usage query (ISO 8601). The provided time range must include the subscription billing cycle anchor day, otherwise no usage data is returned. Use the info endpoint to retrieve the subscription anchor day.",
			optional: true,
			parse: String,
		},
		to: {
			kind: "parsed",
			brief: "End date for the usage query (ISO 8601).",
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
				command: "billing usage get-v1",
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
						command: "cf billing usage get-v1",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billable-usage`,
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
