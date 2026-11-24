import operation from "../../_operations/email-security/sending-domain-restrictions/delete.js";
/**
 * delete command
 * @generated from apis/overlays/email-security.ts
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
	command: "delete <sending-domain-restriction-id>",
	describe: "Delete a sending domain restriction",
	usage:
		"$0 email-security sending-domain-restrictions delete <sending-domain-restriction-id>\n\nRemoves a sending domain restriction. After deletion, TLS will no longer be enforced for emails from this domain.",
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
			placeholder: "sending-domain-restriction-id",
			brief: "Sending domain restriction identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security sending-domain-restrictions delete",
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
						command: "cf email-security sending-domain-restrictions delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/sending_domain_restrictions/${argv["sending-domain-restriction-id"] == null ? "<sending-domain-restriction-id>" : encodeURIComponent(String(argv["sending-domain-restriction-id"]))}`,
						pathParams: {
							"sending-domain-restriction-id": String(
								argv["sending-domain-restriction-id"] ?? ""
							),
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
						message: `This operation deletes the sending domain restriction and removes TLS enforcement for emails from this domain.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						sending_domain_restriction_id:
							argv["sending-domain-restriction-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
