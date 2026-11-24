import operation from "../../../_operations/billing/spend-policies/audit/list.js";
/**
 * list command
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
	command: "list",
	describe: "List Spend Policy Audit Entries",
	usage:
		"$0 billing spend-policies audit list\n\nReturns the policy's evaluation history, newest first. At most one threshold-crossing entry (`limit_reached`) is recorded per policy version and billing period, so a policy update can record a new entry without any change in balance. Disabled policies still return their history; deleted policies return `404`. There is no pagination: use `limit` to set how many entries come back. Defaults to `period=current_billing_cycle`, resolved from the product's canonical aggregates, not calendar months. Crossings match their recorded billing-period bounds, even if recorded late. Set `period=all` for history across cycles. Filtering happens before LIMIT. No current cycle returns an empty array; unavailable or disabled cycle resolution returns `503` with code `1013`, never an empty success.",
	flags: {
		"policy-id": {
			kind: "parsed",
			brief: "Identifies the spend policy.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of audit entries to return. Defaults to 50. Values above 100 are capped at 100 rather than rejected.",
			optional: true,
			parse: Number,
		},
		period: {
			kind: "enum",
			brief:
				"Select current subscription billing-cycle history or history across all cycles.",
			values: ["current_billing_cycle", "all"],
			optional: true,
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
				command: "billing spend-policies audit list",
				classification: {
					safeFlags: ["period", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					period: argv["period"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing spend-policies audit list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billing/spend-policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}/audit`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						policy_id: argv["policy-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
