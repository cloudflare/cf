import operation from "../../../_operations/cloudforce-one/threat-signals/articles/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

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
		.option("per-page", {
			type: "number",
			description:
				"Number of articles per cursor page, from 1 to 100. Defaults to 20.",
		})
		.option("feed-id", {
			type: "string",
			description:
				"Feed UUID filter. Omit to include articles from every account feed.",
		})
		.option("article-id", {
			type: "string",
			description:
				"Repeatable article UUID filter. Returns the union of matching account-owned articles; use this to list every Threat Signals article referenced by an indicator's sources.",
		})
		.option("read", {
			type: "boolean",
			description:
				"Filter by read state. Accepts true, false, 1, or 0; omit to include read and unread articles.",
		})
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
		.option("include-total", {
			type: "boolean",
			description:
				"When true on the first page, count matching articles and return an exact total. Defaults to false; cursor pages do not recalculate totals.",
		})
		.option("search", {
			type: "string",
			description:
				"NFC-normalized, trimmed literal substring filter on article titles; ASCII case-insensitive, from 1 to 500 characters.",
		})
		.option("published-after", {
			type: "string",
			description:
				"Include articles published at or after this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
		})
		.option("published-before", {
			type: "string",
			description:
				"Include articles published at or before this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
		})
		.option("fetched-after", {
			type: "string",
			description:
				"Include articles fetched at or after this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
		})
		.option("fetched-before", {
			type: "string",
			description:
				"Include articles fetched at or before this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
		})
		.option("feed-category", {
			type: "string",
			description:
				"Exact feed-category filter after trimming. Omit to include every category.",
		})
		.option("source-type", {
			type: "string",
			description:
				"Filter by curated or custom feed source. Omit to include both source types.",
			choices: ["curated", "custom"],
		})
		.option("tag-applied-by", {
			type: "string",
			description:
				"Assignment provenance filter. When combined with tag_id or tag_category_id, the matching assignment must have this provenance.",
			choices: ["ai", "analyst", "system"],
		})
		.option("pir-id", {
			type: "string",
			description:
				"Beta. Active Priority Intelligence Requirement to report, filter, and sort relevance by. Omit to use each article's most relevant active PIR. Returns a 400 error unless the PIR is active.",
		})
		.option("min-relevance", {
			type: "string",
			description:
				"Beta. Return only articles at or above this relevance band for pir_id, or for any active PIR when pir_id is omitted. Excludes articles that have not been scored.",
			choices: ["low", "medium", "high"],
		})
		.option("sort", {
			type: "string",
			description:
				"Sort by fetched_at, published_at, title, or relevance (beta). Prefix the field with - for descending order; defaults to -fetched_at. -relevance lists the most relevant articles first, by pir_id or by each article's most relevant active PIR, with unscored articles last.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Threat Signals articles",
	builder,
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
						"min-relevance",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					pir_id: argv["pir-id"],
					min_relevance: argv["min-relevance"],
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
