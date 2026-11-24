import operation from "../../_operations/o11y/issues/remove.js";
/**
 * remove command
 * @generated from apis/overlays/o11y.ts
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "remove <issueId>",
	describe: "Remove an issue group member",
	usage:
		"$0 o11y issues remove <issueId>\n\nRemove an issue from a group, dissolving the group when fewer than two members remain.",
	flags: {
		"group-id": { kind: "parsed", brief: "GroupId", parse: String },
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
	operands: [{ placeholder: "issue-id", brief: "IssueId", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y issues remove",
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
						command: "cf o11y issues remove",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/observability/issues/groups/${argv["group-id"] == null ? "<group-id>" : encodeURIComponent(String(argv["group-id"]))}/members/${argv["issue-id"] == null ? "<issue-id>" : encodeURIComponent(String(argv["issue-id"]))}`,
						pathParams: {
							"group-id": String(argv["group-id"] ?? ""),
							"issue-id": String(argv["issue-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						groupId: argv["group-id"],
						issueId: argv["issue-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
