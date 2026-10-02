import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/ai-search.ts
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
			"$0 ai-search delete <id>\n\nPermanently delete an AI Search instance and all its indexed data."
		)
		.positional("id", {
			type: "string",
			description: "AI Search instance ID.",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description: "Namespace to use for this operation.",
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

type Request = SdkRequest<"ai-search-namespace-delete-instance">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <id>",
	describe: "Delete an AI Search instance.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search delete",
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
						command: "cf ai-search delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/instances/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
						pathParams: {
							id: String(argv["id"] ?? ""),
							name: String(argv["name"] ?? ""),
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
						message: `This operation permanently deletes the AI Search instance and all its indexed data.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.aiSearch.delete({
						account_id: accountId,
						name: argv["name"],
						id: argv["id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
