import operation from "../../_operations/resource-sharing/recipients/delete.js";
/**
 * delete command
 * @generated from apis/overlays/resource-sharing.ts
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
	command: "delete <recipient-id>",
	describe: "Trigger a recipient removal from a share",
	usage:
		"$0 resource-sharing recipients delete <recipient-id>\n\nPerforms a **soft delete**: sets the recipient's `desired_association_status` to `disassociated`, which signals the background reconciliation workflow (Temporal) to remove the shared resources from the recipient account. The recipient record remains in the database for audit purposes and is still returned by `GET /accounts/{account_id}/shares/{share_id}/recipients` with its updated status. Resource access is not fully removed until the workflow completes and `current_association_status` transitions to `disassociated`. The recipient record itself is never physically deleted.",
	flags: {
		"share-id": {
			kind: "parsed",
			brief: "Share identifier tag.",
			parse: String,
		},
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
			placeholder: "recipient-id",
			brief: "Share Recipient identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing recipients delete",
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
						command: "cf resource-sharing recipients delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/recipients/${argv["recipient-id"] == null ? "<recipient-id>" : encodeURIComponent(String(argv["recipient-id"]))}`,
						pathParams: {
							"share-id": String(argv["share-id"] ?? ""),
							"recipient-id": String(argv["recipient-id"] ?? ""),
						},
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
						message: `Are you sure? This action cannot be undone.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						share_id: argv["share-id"],
						recipient_id: argv["recipient-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
