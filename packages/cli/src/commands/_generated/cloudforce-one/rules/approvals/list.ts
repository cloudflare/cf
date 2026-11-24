import operation from "../../../_operations/cloudforce-one/rules/approvals/list.js";
/**
 * list command
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
	command: "list",
	describe: "List rule approvals",
	usage:
		"$0 cloudforce-one rules approvals list\n\nReturns rule approvals with optional status, revision, reviewer-scope, and mutation-type filtering.",
	flags: {
		status: {
			kind: "enum",
			brief:
				"Selects approval statuses. Repeat the parameter to OR-match statuses (for example, status=pending&status=rejected). Use status=all alone to disable status filtering.",
			values: ["pending", "approved", "rejected", "cancelled", "all"],
			optional: true,
		},
		"latest-only": {
			kind: "enum",
			brief: "When true, returns the newest revision in each approval chain.",
			values: ["true", "false"],
			optional: true,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		offset: { kind: "parsed", brief: "Offset", optional: true, parse: Number },
		"reviewer-scope": {
			kind: "enum",
			brief: "Limits approvals to the specified reviewer scope.",
			values: ["default", "email", "unresolved"],
			optional: true,
		},
		"change-type": {
			kind: "enum",
			brief: "Limits approvals to the specified mutation type.",
			values: ["create", "update", "delete"],
			optional: true,
		},
		"rule-id": {
			kind: "parsed",
			brief: "Filter approvals by rule ID.",
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
				command: "cloudforce-one rules approvals list",
				classification: {
					safeFlags: [
						"status",
						"latest-only",
						"reviewer-scope",
						"change-type",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					status: argv["status"],
					latest_only: argv["latest-only"],
					limit: argv["limit"],
					offset: argv["offset"],
					reviewer_scope: argv["reviewer-scope"],
					change_type: argv["change-type"],
					rule_id: argv["rule-id"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules approvals list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/approvals`,
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
