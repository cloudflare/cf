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
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events indicators get\n\nRetrieves indicators across specified datasets, ordered by createdAt descending then UUID, dataset ID, and shard ID ascending. Use the standalone datasetIds value 'all'/'*' for legacy all-datasets behavior, 'analytics' for isAnalytics=true datasets, or 'operational' for isAnalytics=false datasets. If no datasetIds are provided, uses the default dataset."
		)
		.option("dataset-ids", {
			type: "string",
			description:
				"Dataset UUIDs to query, or one standalone scope value: 'all'/'*' for legacy all-datasets behavior, 'analytics' for isAnalytics=true datasets, or 'operational' for isAnalytics=false datasets. If not provided, uses the default dataset.",
		})
		.option("page", { type: "number", description: "Page" })
		.option("page-size", { type: "number", description: "PageSize" })
		.option("search", {
			type: "string",
			description:
				'Structured search as a JSON array of {field, op, value} objects. Searchable fields: value, indicatorType, uuid. Supports operators: equals, not, contains, startsWith, endsWith, gt, lt, gte, lte, like, in, find. Use the \'in\' operator with an array value to bulk-check up to 100 indicators in a single request, e.g. search=[{"field":"value","op":"in","value":["evil.com","bad.org"]}]. Multiple conditions are AND\'d together. Max 10 conditions per request.',
		})
		.option("name", {
			type: "string",
			description:
				"Filter indicators by value using substring match (LIKE). Legacy alternative to structured search.",
		})
		.option("indicator-type", { type: "string", description: "IndicatorType" })
		.option("related-events", {
			type: "string",
			description: "Filter by related event IDs",
		})
		.option("tags", {
			type: "string",
			description:
				"Filter by tag values or UUIDs. Indicators must have at least one of the specified tags (OR logic). Supports both tag UUID and tag value.",
		})
		.option("tag-search", {
			type: "string",
			description:
				'Structured tag-metadata filter as a JSON array of {field, op, value} objects. Operates against the per-dataset IndicatorTag mirror so you can find indicators by tag attributes (origin country, motive, sophistication, priority, etc.) without a separate Tags lookup. Common dashboard usage: drill from a country into indicators, e.g. tagSearch=[{"field":"originCountryISO","op":"in","value":["IR","CN"]}]. Country values may be passed as alpha-2, alpha-3, name, or alias (e.g. "iran"). Operators: equals, not, gt/gte/lt/lte (numeric only), contains/like/find/startsWith/endsWith (string only), in. AND-joined across entries; combined with `tags`, a matching tag must satisfy both. Max 10 entries per request, max 100 values per \'in\'. Performance notes: `originCountryISO` uses its B-tree index for equals/not/in. `priority` uses its B-tree index for numeric comparisons. Other string columns (`actorCategory`, `motive`, etc.) are case-insensitive and unindexed; current catalog size makes this a non-issue. `endsWith` and `aliasGroupNames` contains/like are leading-wildcard scans and slow on large result sets. `aliasGroupNames` matches on the JSON-encoded text, so substrings can cross alias boundaries ("apt28" also matches "apt280" when both appear in the same tag\'s alias list).',
		})
		.option("created-after", {
			type: "string",
			description:
				"Filter indicators created on or after this date. Must use ISO 8601 format (e.g., '2024-01-15T00:00:00Z').",
		})
		.option("created-before", {
			type: "string",
			description:
				"Filter indicators created on or before this date. Must use ISO 8601 format (e.g., '2024-12-31T23:59:59Z').",
		})
		.option("related-events-limit", {
			type: "number",
			description:
				"Limit the number of related events returned per indicator. Default: 2. Set to 0 for none, -1 for all events.",
		})
		.option("include-tags", {
			type: "boolean",
			description:
				"Whether to include full tag details for each indicator. Defaults to true.",
		})
		.option("include-total-count", {
			type: "boolean",
			description:
				"Whether to compute total count via COUNT(*). Defaults to false for performance. total_count is null unless this is true and the complete fan-out succeeds.",
		})
		.option("format", {
			type: "string",
			description:
				"Output format for indicator data. 'json' returns the default format, 'stix2' returns STIX 2.1 Indicator SDOs, 'taxii' returns a TAXII 2.1 Envelope with Content-Type application/taxii+json;version=2.1.",
			choices: ["json", "stix2", "taxii"],
		})
		.option("cache", {
			type: "string",
			description:
				"Cache strategy. 'from-graph' serves results from the graph-node KV cache when all requested UUIDs are cached; falls back to normal path on partial/zero hit. Cannot be combined with `cursor`.",
			choices: ["from-graph"],
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque cursor from a previous response's `pagination.cursor`. When provided, all filters, datasetIds, page, `pageSize`, `includeTags` and `relatedEventsLimit` come from the cursor — do not resend them. Sending any filter, `page`, `pageSize`, `includeTags`, `relatedEventsLimit`, `includeTotalCount=true`, or `cache=from-graph` alongside a cursor yields a 400 `CursorFilterConflictError`. A cursor issued for a different entity, an unsupported version, or a dataset that has since been reconfigured as analytics-only yields a 400 `InvalidCursorError`.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_IndicatorList">;
type Query = SdkQuery<"get_IndicatorList">;

const typedBuilder = withArgTypes<
	{
		search: Query["search"];
		"tag-search": Query["tagSearch"];
		format: Query["format"];
		cache: Query["cache"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Lists indicators across multiple datasets",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events indicators get",
				classification: {
					safeFlags: [
						"include-tags",
						"include-total-count",
						"format",
						"cache",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
						command: "cf cloudforce-one events indicators get",
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
					client.cloudforceOne.events.indicators.get({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
