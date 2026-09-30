import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list-builds command
 * @generated from apis/overlays/workers-builds.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers-builds workers previews list-builds <preview-id>\n\nList the builds of a single Preview with pagination."
		)
		.positional("preview-id", {
			type: "string",
			description:
				"The script tag of the Preview, which is a Worker in its own right",
			demandOption: true,
		})
		.option("script-tag", {
			type: "string",
			description: "The Worker script tag (external script ID)",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "Page number for pagination",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"listBuildsByPreview">;
type Query = SdkQuery<"listBuildsByPreview">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list-builds <preview-id>",
	describe: "List builds by preview",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers-builds workers previews list-builds",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers-builds workers previews list-builds",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["script-tag"] == null ? "<script-tag>" : encodeURIComponent(String(argv["script-tag"]))}/previews/${argv["preview-id"] == null ? "<preview-id>" : encodeURIComponent(String(argv["preview-id"]))}/builds`,
						pathParams: {
							"script-tag": String(argv["script-tag"] ?? ""),
							"preview-id": String(argv["preview-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.workersBuilds.workers.previews.listBuilds({
						account_id: accountId,
						script_tag: argv["script-tag"],
						preview_id: argv["preview-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
