import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/ai-search.ts
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
			"$0 ai-search items list\n\nLists indexed items in an AI Search instance."
		)
		.option("name", {
			type: "string",
			description: "Namespace to use for this operation.",
			demandOption: true,
		})
		.option("id", {
			type: "string",
			description: "AI Search instance ID.",
			demandOption: true,
		})
		.option("page", { type: "number", description: "Page" })
		.option("per-page", { type: "number", description: "Per page" })
		.option("search", { type: "string", description: "Search" })
		.option("sort-by", {
			type: "string",
			description:
				'Sort order for items. "status" (default) sorts by status priority then last_seen_at. "modified_at" sorts by file modification time (most recent first), falling back to created_at.',
			choices: ["status", "modified_at"],
		})
		.option("status", {
			type: "string",
			description: "Status",
			choices: [
				"queued",
				"running",
				"completed",
				"error",
				"skipped",
				"outdated",
			],
		})
		.option("source", {
			type: "string",
			description:
				'Filter items by source_id. Use "builtin" for uploaded files, or a source identifier like "web-crawler:https://example.com".',
		})
		.option("metadata-filter", {
			type: "string",
			description:
				'JSON-encoded metadata filter using Vectorize filter syntax. Examples: {"folder":"reports/"}, {"timestamp":{"$gte":1700000000000}}, {"folder":{"$in":["docs/","reports/"]}}',
		})
		.option("item-id", {
			type: "string",
			description: "Filter items by their unique ID. Returns at most one item.",
		})
		.option("key", {
			type: "string",
			description:
				"Filter items by their exact key (object key / filename). Keys are unique per source, so combine with `source` to disambiguate across data sources.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"ai-search-namespace-instance-list-items">;
type Query = SdkQuery<"ai-search-namespace-instance-list-items">;

const typedBuilder = withArgTypes<
	{
		"sort-by": Query["sort_by"];
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Items List.",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search items list",
				classification: {
					safeFlags: ["sort-by", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					sort_by: argv["sort-by"],
					status: argv["status"],
					source: argv["source"],
					metadata_filter: argv["metadata-filter"],
					item_id: argv["item-id"],
					key: argv["key"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search items list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/instances/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/items`,
						pathParams: {
							id: String(argv["id"] ?? ""),
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

				const result = await withProgress(`Loading`, async () =>
					client.aiSearch.items.list({
						account_id: accountId,
						name: argv["name"],
						id: argv["id"],
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
