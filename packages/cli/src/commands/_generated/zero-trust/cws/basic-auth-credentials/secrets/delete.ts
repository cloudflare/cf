import operation from "../../../../_operations/zero-trust/cws/basic-auth-credentials/secrets/delete.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws basic-auth-credentials secrets delete <secret-id>\n\nDeletes the specified secret from the credential."
		)
		.positional("secret-id", {
			type: "string",
			description: "ID of the secret to delete",
			demandOption: true,
		})
		.option("credential-id", {
			type: "string",
			description: "ID of the parent credential",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <secret-id>",
	describe: "Delete a basic-auth secret",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws basic-auth-credentials secrets delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws basic-auth-credentials secrets delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/basic-auth-credentials/${argv["credential-id"] == null ? "<credential-id>" : encodeURIComponent(String(argv["credential-id"]))}/secrets/${argv["secret-id"] == null ? "<secret-id>" : encodeURIComponent(String(argv["secret-id"]))}`,
						pathParams: {
							"credential-id": String(argv["credential-id"] ?? ""),
							"secret-id": String(argv["secret-id"] ?? ""),
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
						message: `Delete this basic-auth secret?`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						credential_id: argv["credential-id"],
						secret_id: argv["secret-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
