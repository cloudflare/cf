import operation from "../../../_operations/cloudforce-one/threat-intel/indicators/list.js";
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
	describe: "List indicators",
	usage:
		"$0 cloudforce-one threat-intel indicators list\n\nLists indicators across datasets, newest first. `datasetIds` accepts dataset UUIDs or one scope value used alone: `all` (or `*`) and `operational` select the intelligence datasets you can read, and `analytics` selects the analytics datasets you can read. Without `datasetIds`, the default dataset is used.",
	flags: {
		"dataset-ids": {
			kind: "parsed",
			brief:
				"Dataset UUIDs to query, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). If not provided, uses the default dataset.",
			variadic: true,
			optional: true,
			parse: String,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"page-size": {
			kind: "parsed",
			brief: "PageSize",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief:
				'Structured search as a JSON array of {field, op, value} objects. Searchable fields: value, indicatorType, uuid. Supports operators: equals, not, contains, startsWith, endsWith, gt, lt, gte, lte, like, in, find. Use the \'in\' operator with an array value to bulk-check up to 100 indicators in a single request, e.g. search=[{"field":"value","op":"in","value":["evil.com","bad.org"]}]. Multiple conditions are AND\'d together. Max 10 conditions per request.',
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"Filter indicators by value using substring match (LIKE). Legacy alternative to structured search.",
			optional: true,
			parse: String,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "IndicatorType",
			optional: true,
			parse: String,
		},
		"related-events": {
			kind: "parsed",
			brief: "Filter by related event IDs",
			variadic: true,
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				"Filter by tag values or UUIDs. Indicators must have at least one of the specified tags (OR logic). Supports both tag UUID and tag value.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"tag-search": {
			kind: "parsed",
			brief:
				'Structured tag-metadata filter as a JSON array of {field, op, value} objects. Operates against the per-dataset IndicatorTag mirror so you can find indicators by tag attributes (origin country, motive, sophistication, priority, etc.) without a separate Tags lookup. Common dashboard usage: drill from a country into indicators, e.g. tagSearch=[{"field":"originCountryISO","op":"in","value":["IR","CN"]}]. Country values may be passed as alpha-2, alpha-3, name, or alias (e.g. "iran"). Operators: equals, not, gt/gte/lt/lte (numeric only), contains/like/find/startsWith/endsWith (string only), in. AND-joined across entries; combined with `tags`, a matching tag must satisfy both. Max 10 entries per request, max 100 values per \'in\'. Performance notes: `originCountryISO` uses its B-tree index for equals/not/in. `priority` uses its B-tree index for numeric comparisons. Other string columns (`actorCategory`, `motive`, etc.) are case-insensitive and unindexed; current catalog size makes this a non-issue. `endsWith` and `aliasGroupNames` contains/like are leading-wildcard scans and slow on large result sets. `aliasGroupNames` matches on the JSON-encoded text, so substrings can cross alias boundaries ("apt28" also matches "apt280" when both appear in the same tag\'s alias list).',
			variadic: true,
			optional: true,
			parse: String,
		},
		"created-after": {
			kind: "parsed",
			brief:
				"Filter indicators created on or after this date. Must use ISO 8601 format (e.g., '2024-01-15T00:00:00Z').",
			optional: true,
			parse: String,
		},
		"created-before": {
			kind: "parsed",
			brief:
				"Filter indicators created on or before this date. Must use ISO 8601 format (e.g., '2024-12-31T23:59:59Z').",
			optional: true,
			parse: String,
		},
		"related-events-limit": {
			kind: "parsed",
			brief:
				"Limit the number of related events returned per indicator. Default: 2. Set to 0 for none, -1 for all events. For JSON responses, when the limit hides events, the indicator carries `relatedEventsHasMore: true` and the response includes an advisory message — the cap is never applied silently. STIX and TAXII representations do not include related-event data.",
			optional: true,
			parse: Number,
		},
		"include-tags": {
			kind: "boolean",
			brief:
				"Whether to include full tag details for each indicator. Defaults to true.",
			optional: true,
		},
		"include-total-count": {
			kind: "boolean",
			brief:
				"Whether to compute total count via COUNT(*). Defaults to false for performance. total_count is null unless this is true and the complete fan-out succeeds.",
			optional: true,
		},
		format: {
			kind: "enum",
			brief:
				"Output format for indicator data. 'json' returns the default format, 'stix2' returns STIX 2.1 Indicator SDOs, 'taxii' returns a TAXII 2.1 Envelope with Content-Type application/taxii+json;version=2.1.",
			values: ["json", "stix2", "taxii"],
			optional: true,
		},
		cache: {
			kind: "enum",
			brief:
				"Cache strategy. 'from-graph' serves results from the graph-node KV cache when all requested UUIDs are cached; falls back to normal path on partial/zero hit. Cannot be combined with `cursor`.",
			values: ["from-graph"],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from a previous response's `pagination.cursor`. When provided, all filters, datasetIds, page, `pageSize`, `includeTags` and `relatedEventsLimit` come from the cursor — do not resend them. Sending any filter, `page`, `pageSize`, `includeTags`, `relatedEventsLimit`, `includeTotalCount=true`, or `cache=from-graph` alongside a cursor yields a 400 `CursorFilterConflictError`. A cursor issued for a different entity, an unsupported version, or a dataset that has since been reconfigured as analytics-only yields a 400 `InvalidCursorError`.",
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
				command: "cloudforce-one threat-intel indicators list",
				classification: {
					safeFlags: [
						"include-tags",
						"include-total-count",
						"format",
						"cache",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					datasetIds: argv["dataset-ids"],
					page: argv["page"],
					pageSize: argv["page-size"],
					search: argv["search"],
					name: argv["name"],
					indicatorType: argv["indicator-type"],
					relatedEvents: argv["related-events"],
					tags: argv["tags"],
					tagSearch: argv["tag-search"],
					createdAfter: argv["created-after"],
					createdBefore: argv["created-before"],
					relatedEventsLimit: argv["related-events-limit"],
					includeTags: argv["include-tags"],
					includeTotalCount: argv["include-total-count"],
					format: argv["format"],
					cache: argv["cache"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel indicators list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/indicators`,
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
