import operation from "../../_operations/workflows/instances/get.js";
/**
 * get command
 * @generated from apis/overlays/workflows.ts
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
	command: "get <instance-id>",
	describe: "Get logs and status from instance",
	usage:
		"$0 workflows instances get <instance-id>\n\nRetrieves logs and execution status for a specific workflow instance.",
	flags: {
		"workflow-name": { kind: "parsed", brief: "Workflow name", parse: String },
		simple: {
			kind: "enum",
			brief:
				"When true, omits step details and returns only metadata with step_count.",
			values: ["true", "false"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief:
				'Step ordering: "asc" (default, oldest first) or "desc" (newest first).',
			values: ["asc", "desc"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "instance-id",
			brief:
				"Instance identifier. User-created instances match \`^[a-zA-Z0-9_][a-zA-Z0-9-_]*$\` (max 100 characters); cron-triggered instances can use a longer, system-generated id derived from the cron expression.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances get",
				classification: {
					safeFlags: ["simple", "order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					simple: argv["simple"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
						},
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
						workflow_name: argv["workflow-name"],
						instance_id: argv["instance-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
