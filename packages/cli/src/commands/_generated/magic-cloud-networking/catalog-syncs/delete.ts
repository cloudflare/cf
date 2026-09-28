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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-cloud-networking catalog-syncs delete <sync-id>\n\nDelete a Catalog Sync (Closed Beta)."
		)
		.positional("sync-id", {
			type: "string",
			description: "Sync ID",
			demandOption: true,
		})
		.option("delete-destination", {
			type: "boolean",
			description: "Delete destination",
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

type Request = SdkRequest<"catalog-syncs-delete">;
type Query = SdkQuery<"catalog-syncs-delete">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <sync-id>",
	describe: "Delete Catalog Sync",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking catalog-syncs delete",
				classification: {
					safeFlags: ["delete-destination", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					delete_destination: argv["delete-destination"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-cloud-networking catalog-syncs delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/catalog-syncs/${argv["sync-id"] == null ? "<sync-id>" : encodeURIComponent(String(argv["sync-id"]))}`,
						pathParams: { "sync-id": String(argv["sync-id"] ?? "") },
						query: queryParams,
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
					client.magicCloudNetworking.catalogSyncs.delete({
						account_id: accountId,
						sync_id: argv["sync-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
