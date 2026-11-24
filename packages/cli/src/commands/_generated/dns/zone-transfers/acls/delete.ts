import operation from "../../../_operations/dns/zone-transfers/acls/delete.js";
/**
 * delete command
 * @generated from apis/overlays/dns.ts
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
	command: "delete <acl-id>",
	describe: "Delete ACL",
	usage: "$0 dns zone-transfers acls delete <acl-id>\n\nDelete ACL.",
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
	operands: [{ placeholder: "acl-id", brief: "Acl ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns zone-transfers acls delete",
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
						command: "cf dns zone-transfers acls delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/secondary_dns/acls/${argv["acl-id"] == null ? "<acl-id>" : encodeURIComponent(String(argv["acl-id"]))}`,
						pathParams: { "acl-id": String(argv["acl-id"] ?? "") },
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
						acl_id: argv["acl-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
