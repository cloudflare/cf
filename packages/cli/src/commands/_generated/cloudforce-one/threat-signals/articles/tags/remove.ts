import operation from "../../../../_operations/cloudforce-one/threat-signals/articles/tags/remove.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * remove command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one threat-signals articles tags remove <tag-id>\n\nRemoves a tag from a Threat Signals article."
		)
		.positional("tag-id", {
			type: "string",
			description: "UUID of a tag from the account's catalog",
			demandOption: true,
		})
		.option("article-id", {
			type: "string",
			description: "Threat Signals article UUID",
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
	command: "remove <tag-id>",
	describe: "Remove tag from Threat Signals article",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals articles tags remove",
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
						command: "cf cloudforce-one threat-signals articles tags remove",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles/${argv["article-id"] == null ? "<article-id>" : encodeURIComponent(String(argv["article-id"]))}/tags/${argv["tag-id"] == null ? "<tag-id>" : encodeURIComponent(String(argv["tag-id"]))}`,
						pathParams: {
							"article-id": String(argv["article-id"] ?? ""),
							"tag-id": String(argv["tag-id"] ?? ""),
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
					client.send(operation, {
						account_id: accountId,
						article_id: argv["article-id"],
						tag_id: argv["tag-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
