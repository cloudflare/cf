import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/ai.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai models list\n\nSearches Workers AI models by name or description."
		)
		.option("per-page", { type: "number", description: "Per page" })
		.option("page", { type: "number", description: "Page" })
		.option("task", { type: "string", description: "Filter by Task Name." })
		.option("author", { type: "string", description: "Filter by Author." })
		.option("source", { type: "number", description: "Filter by Source Id." })
		.option("hide-experimental", {
			type: "boolean",
			description: "Filter to hide experimental models.",
		})
		.option("search", { type: "string", description: "Search." })
		.option("include-deprecated", {
			type: "boolean",
			description:
				"If true, include models for up to three months after their deprecation date. Defaults to false.",
		})
		.option("format", {
			type: "string",
			description:
				"If set, return models in the requested marketplace format instead of the default response.",
			choices: ["openrouter"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"workers-ai-search-model">;
type Query = SdkQuery<"workers-ai-search-model">;

const typedBuilder = withArgTypes<
	{
		format: Query["format"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Model Search",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai models list",
				classification: {
					safeFlags: [
						"hide-experimental",
						"include-deprecated",
						"format",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					per_page: argv["per-page"],
					page: argv["page"],
					task: argv["task"],
					author: argv["author"],
					source: argv["source"],
					hide_experimental: argv["hide-experimental"],
					search: argv["search"],
					include_deprecated: argv["include-deprecated"],
					format: argv["format"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai models list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai/models/search`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.ai.models.list({
						account_id: accountId,
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
