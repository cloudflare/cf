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
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/flagship.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 flagship apps flags delete <flag-key>\n\nDeletes a flag permanently. After deletion propagates, direct evaluations return not found; typed binding accessors may return the caller-supplied default. Cannot be undone."
		)
		.positional("flag-key", {
			type: "string",
			description: "Case-sensitive key identifying the flag within the app.",
			demandOption: true,
		})
		.option("app-id", {
			type: "string",
			description: "Flagship app ID returned when the app was created.",
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

type Request = SdkRequest<"flagship_delete_flag">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <flag-key>",
	describe: "Delete flag",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "flagship apps flags delete",
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
						command: "cf flagship apps flags delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/flagship/apps/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/flags/${argv["flag-key"] == null ? "<flag-key>" : encodeURIComponent(String(argv["flag-key"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"flag-key": String(argv["flag-key"] ?? ""),
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
						message: `Delete this feature flag? After the deletion propagates, evaluation requests can no longer resolve it. This action cannot be undone.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.flagship.apps.flags.delete({
						account_id: accountId,
						app_id: argv["app-id"],
						flag_key: argv["flag-key"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
