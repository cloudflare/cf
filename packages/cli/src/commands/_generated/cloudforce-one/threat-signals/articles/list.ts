import operation from "../../../_operations/cloudforce-one/threat-signals/articles/list.js";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "list",
	describe: "List Threat Signals articles",
	usage:
		"$0 cloudforce-one threat-signals articles list\n\nLists articles from the account's Threat Signals feeds.",
	flags: {
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from a previous response's `next_cursor`. When provided, pagination, ordering, totals, and article filters come from the cursor. Sending `per_page`, `sort`, `include_total`, or any article filter alongside it returns a 400 `CursorFilterConflictError`.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of articles per cursor page, from 1 to 100. Defaults to 20.",
			optional: true,
			parse: Number,
		},
		"feed-id": {
			kind: "parsed",
			brief:
				"Feed UUID filter. Omit to include articles from every account feed.",
			optional: true,
			parse: String,
		},
		"article-id": {
			kind: "parsed",
			brief:
				"Repeatable article UUID filter. Returns the union of matching account-owned articles; use this to list every Threat Signals article referenced by an indicator's sources.",
			variadic: true,
			optional: true,
			parse: String,
		},
		read: {
			kind: "boolean",
			brief:
				"Filter by read state. Accepts true, false, 1, or 0; omit to include read and unread articles.",
			optional: true,
		},
		"tag-id": {
			kind: "parsed",
			brief: "Repeatable tag UUID filter. An article matches any selected tag.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"tag-category-id": {
			kind: "parsed",
			brief:
				"Repeatable tag-category UUID filter. An article matches any selected category; when tag_id is also present, the tag and category groups are ANDed.",
			variadic: true,
			optional: true,
			parse: String,
		},
		tag: {
			kind: "parsed",
			brief:
				"Legacy human-readable tag-value filter. Ignored when tag_id is supplied; prefer tag_id.",
			optional: true,
			parse: String,
		},
		"tag-category": {
			kind: "parsed",
			brief:
				"Legacy category-name disambiguator for tag. It has no effect without tag; prefer tag_category_id.",
			optional: true,
			parse: String,
		},
		"include-total": {
			kind: "boolean",
			brief:
				"When true on the first page, count matching articles and return an exact total. Defaults to false; cursor pages do not recalculate totals.",
			optional: true,
		},
		search: {
			kind: "parsed",
			brief:
				"NFC-normalized, trimmed literal substring filter on article titles; ASCII case-insensitive, from 1 to 500 characters.",
			optional: true,
			parse: String,
		},
		"published-after": {
			kind: "parsed",
			brief:
				"Include articles published at or after this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
			optional: true,
			parse: String,
		},
		"published-before": {
			kind: "parsed",
			brief:
				"Include articles published at or before this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
			optional: true,
			parse: String,
		},
		"fetched-after": {
			kind: "parsed",
			brief:
				"Include articles fetched at or after this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
			optional: true,
			parse: String,
		},
		"fetched-before": {
			kind: "parsed",
			brief:
				"Include articles fetched at or before this ISO 8601 date-time with Z or a numeric UTC offset; normalized to UTC.",
			optional: true,
			parse: String,
		},
		"feed-category": {
			kind: "parsed",
			brief:
				"Exact feed-category filter after trimming. Omit to include every category.",
			optional: true,
			parse: String,
		},
		"source-type": {
			kind: "enum",
			brief:
				"Filter by curated or custom feed source. Omit to include both source types.",
			values: ["curated", "custom"],
			optional: true,
		},
		"tag-applied-by": {
			kind: "enum",
			brief:
				"Assignment provenance filter. When combined with tag_id or tag_category_id, the matching assignment must have this provenance.",
			values: ["ai", "analyst", "system"],
			optional: true,
		},
		"pir-id": {
			kind: "parsed",
			brief:
				"Beta. Active Priority Intelligence Requirement to report, filter, and sort relevance by. Omit to use each article's most relevant active PIR. Returns a 400 error unless the PIR is active.",
			optional: true,
			parse: String,
		},
		"min-relevance": {
			kind: "enum",
			brief:
				"Beta. Return only articles at or above this relevance band for pir_id, or for any active PIR when pir_id is omitted. Excludes articles that have not been scored.",
			values: ["low", "medium", "high"],
			optional: true,
		},
		severity: {
			kind: "parsed",
			brief:
				"Beta. Repeatable intrinsic severity band filter. An article matches any selected band, the band reported as its severity. Excludes articles without a severity. Like the severity field, severity is reported only while the account has an active Priority Intelligence Requirement; otherwise no articles match.",
			variadic: true,
			optional: true,
			choices: ["informational", "low", "medium", "high", "critical"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		sort: {
			kind: "parsed",
			brief:
				"Sort by fetched_at, published_at, title, or relevance (beta). Prefix the field with - for descending order; defaults to -fetched_at. -relevance lists the most relevant articles first, by pir_id or by each article's most relevant active PIR, with unscored articles last.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
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
				} satisfies ArgClassification<typeof argv>,
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
					severity: argv["severity"],
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
});

export default command;
