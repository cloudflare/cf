import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/previews.ts
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
		.usage("$0 previews delete <name>\n\nDelete a Preview.")
		.positional("name", {
			type: "string",
			description:
				"Identifier for the Preview, which can be ID, slug, or URL-encoded name.",
			demandOption: true,
		})
		.option("worker", {
			type: "string",
			description: "Identifier for the Worker, which can be ID or name.",
			demandOption: true,
		})
		.option("delete-with-references", {
			type: "boolean",
			description:
				"If true, delete the Preview even when other Workers still reference it. Service bindings in those Workers may be left broken. Durable Object namespaces implemented by the deleted Preview are deleted even if other Workers reference them.",
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

type Request = SdkRequest<"workers.previews.delete">;
type Query = SdkQuery<"workers.previews.delete">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <name>",
	describe: "Delete Preview",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "previews delete",
				classification: {
					safeFlags: ["delete-with-references", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					force: argv["delete-with-references"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf previews delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/previews/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}`,
						pathParams: {
							worker: String(argv["worker"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						query: queryParams,
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
						message: `This operation permanently deletes the Preview.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.previews.delete({
						account_id: accountId,
						worker: argv["worker"],
						name: argv["name"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
