import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/resource-sharing.ts
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
			"$0 resource-sharing excluded-recipients delete <excluded-recipient-id>\n\nRemoves a single account from a share's excluded-recipient list. The account becomes eligible to receive the share again on the next reconciliation cycle."
		)
		.positional("excluded-recipient-id", {
			type: "string",
			description: "Share Excluded Recipient identifier tag.",
			demandOption: true,
		})
		.option("share-id", {
			type: "string",
			description: "Share identifier tag.",
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

type Request = SdkRequest<"share-excluded-recipient-delete">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <excluded-recipient-id>",
	describe: "Trigger an account un-exclusion from a share",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing excluded-recipients delete",
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
						command: "cf resource-sharing excluded-recipients delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/excluded-recipients/${argv["excluded-recipient-id"] == null ? "<excluded-recipient-id>" : encodeURIComponent(String(argv["excluded-recipient-id"]))}`,
						pathParams: {
							"share-id": String(argv["share-id"] ?? ""),
							"excluded-recipient-id": String(
								argv["excluded-recipient-id"] ?? ""
							),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.resourceSharing.excludedRecipients.delete({
						account_id: accountId,
						share_id: argv["share-id"],
						excluded_recipient_id: argv["excluded-recipient-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
