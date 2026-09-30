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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-signals articles list\n\nLists articles from the account's Threat Signals feeds."
		)
		.option("cursor", {
			type: "string",
			description:
				"Opaque cursor from a previous response's `next_cursor`. When provided, pagination, ordering, totals, and article filters come from the cursor. Sending `per_page`, `sort`, `include_total`, or any article filter alongside it returns a 400 `CursorFilterConflictError`.",
		})
		.option("per-page", { type: "number", description: "Per page" })
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("feed-id", { type: "string", description: "Feed ID" })
		.option("article-id", {
			type: "string",
			description:
				"Repeatable article UUID filter. Returns the union of matching account-owned articles; use this to list every Threat Signals article referenced by an indicator's sources.",
		})
		.option("read", { type: "boolean", description: "Read" })
		.option("tag-id", {
			type: "string",
			description:
				"Repeatable tag UUID filter. An article matches any selected tag.",
		})
		.option("tag-category-id", {
			type: "string",
			description:
				"Repeatable tag-category UUID filter. An article matches any selected category; when tag_id is also present, the tag and category groups are ANDed.",
		})
		.option("tag", {
			type: "string",
			description:
				"Legacy human-readable tag-value filter. Ignored when tag_id is supplied; prefer tag_id.",
		})
		.option("tag-category", {
			type: "string",
			description:
				"Legacy category-name disambiguator for tag. It has no effect without tag; prefer tag_category_id.",
		})
		.option("include-total", { type: "boolean", description: "Include total" })
		.option("search", { type: "string", description: "Search" })
		.option("published-after", {
			type: "string",
			description: "Published after",
		})
		.option("published-before", {
			type: "string",
			description: "Published before",
		})
		.option("fetched-after", { type: "string", description: "Fetched after" })
		.option("fetched-before", { type: "string", description: "Fetched before" })
		.option("feed-category", { type: "string", description: "Feed category" })
		.option("source-type", {
			type: "string",
			description: "Source type",
			choices: ["curated", "custom"],
		})
		.option("tag-applied-by", {
			type: "string",
			description:
				"Assignment provenance filter. When combined with tag_id or tag_category_id, the matching assignment must have this provenance.",
			choices: ["ai", "analyst", "system"],
		})
		.option("sort", { type: "string", description: "Sort" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"rssArticleList">;
type Query = SdkQuery<"rssArticleList">;

const typedBuilder = withArgTypes<
	{
		"source-type": Query["source_type"];
		"tag-applied-by": Query["tag_applied_by"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Threat Signals articles",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals articles list",
				classification: {
					safeFlags: [
						"read",
						"include-total",
						"source-type",
						"tag-applied-by",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					feed_id: argv["feed-id"],
					article_id: argv["article-id"],
					read: argv["read"],
					tag_id: argv["tag-id"],
					tag_category_id: argv["tag-category-id"],
					tag: argv["tag"],
					tag_category: argv["tag-category"],
					include_total: argv["include-total"],
					search: argv["search"],
					published_after: argv["published-after"],
					published_before: argv["published-before"],
					fetched_after: argv["fetched-after"],
					fetched_before: argv["fetched-before"],
					feed_category: argv["feed-category"],
					source_type: argv["source-type"],
					tag_applied_by: argv["tag-applied-by"],
					sort: argv["sort"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals articles list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles`,
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
					client.cloudforceOne.threatSignals.articles.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
