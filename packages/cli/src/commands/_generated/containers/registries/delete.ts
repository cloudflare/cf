import operation from "../../_operations/containers/registries/delete.js";
/**
 * delete command
 * @generated from apis/overlays/containers.ts
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
	command: "delete <domain>",
	describe: "Delete a registry from the account",
	usage:
		"$0 containers registries delete <domain>\n\nDelete a registry from the account, this will prevent Containers from pulling images from the registry.",
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
		{ placeholder: "domain", brief: "The domain to delete.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers registries delete",
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
						command: "cf containers registries delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/registries/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}`,
						pathParams: { domain: String(argv["domain"] ?? "") },
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
						message: `This operation deletes the registry configuration. Containers will no longer be able to pull images from it.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						domain: argv["domain"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
