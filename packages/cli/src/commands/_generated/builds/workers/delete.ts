/**
 * delete command
 * @generated from apis/overlays/builds.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <worker>",
	describe: "Delete Worker build configuration",
	usage:
		"$0 builds workers delete <worker>\n\nDelete build settings and triggers for a Worker tag and cancel unfinished builds. The Worker is not deleted.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "worker",
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds workers delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds workers delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}`,
						pathParams: { worker: String(argv["worker"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation deletes the Worker build configuration and its triggers, and cancels unfinished builds. The Worker is not deleted.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"DELETE",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}`
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
