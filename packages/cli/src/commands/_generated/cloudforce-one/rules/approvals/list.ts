import operation from "../../../_operations/cloudforce-one/rules/approvals/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
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
			"$0 cloudforce-one rules approvals list\n\nReturns rule approvals with optional status, revision, reviewer-scope, and mutation-type filtering."
		)
		.option("status", {
			type: "string",
			description:
				"Selects approval statuses. Repeat the parameter to OR-match statuses (for example, status=pending&status=rejected). Use status=all alone to disable status filtering.",
			choices: ["pending", "approved", "rejected", "cancelled", "all"],
		})
		.option("latest-only", {
			type: "string",
			description:
				"When true, returns the newest revision in each approval chain.",
			choices: ["true", "false"],
		})
		.option("limit", { type: "number", description: "Limit" })
		.option("offset", { type: "number", description: "Offset" })
		.option("reviewer-scope", {
			type: "string",
			description: "Limits approvals to the specified reviewer scope.",
			choices: ["default", "email", "unresolved"],
		})
		.option("change-type", {
			type: "string",
			description: "Limits approvals to the specified mutation type.",
			choices: ["create", "update", "delete"],
		})
		.option("rule-id", {
			type: "string",
			description: "Filter approvals by rule ID.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List rule approvals",
	builder,
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
				} satisfies ArgClassification<Args>,
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
};

export default command;
