import operation from "../../_operations/workflows/concurrency/delete.js";
/**
 * delete command
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <key-id>",
	describe: "Delete a concurrency key",
	usage:
		"$0 workflows concurrency delete <key-id>\n\nDeletes a concurrency key. Fails while any workflow’s latest version references the key. The key disappears immediately, but steps already holding it keep their slots until they finish and still count against a key re-created with the same name.",
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
			placeholder: "key-id",
			brief: "Identifier of the concurrency key.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows concurrency delete",
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
						command: "cf workflows concurrency delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/concurrency/${argv["key-id"] == null ? "<key-id>" : encodeURIComponent(String(argv["key-id"]))}`,
						pathParams: { "key-id": String(argv["key-id"] ?? "") },
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
						key_id: argv["key-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
