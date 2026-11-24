/**
 * list command
 * @generated from apis/overlays/ai-search.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "Items List.",
	usage:
		"$0 ai-search items list\n\nLists indexed items in an AI Search instance.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
		"instance-id": {
			kind: "parsed",
			brief: "AI Search instance ID.",
			parse: String,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		"sort-by": {
			kind: "enum",
			brief:
				'Sort order for items. "status" (default) sorts items according to status priority, then last_seen_at. "modified_at" sorts items according to file modification time (most recent first), falling back to created_at.',
			values: ["status", "modified_at"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief: "Status",
			values: [
				"queued",
				"running",
				"completed",
				"error",
				"skipped",
				"outdated",
			],
			optional: true,
		},
		source: {
			kind: "parsed",
			brief:
				'Return only items with this source_id. Use "builtin" for uploaded files, or a source identifier like "web-crawler:https://example.com".',
			optional: true,
			parse: String,
		},
		"metadata-filter": {
			kind: "parsed",
			brief:
				'JSON-encoded metadata filter using Vectorize filter syntax. Examples: {"folder":"reports/"}, {"timestamp":{"$gte":1700000000000}}, {"folder":{"$in":["docs/","reports/"]}}.',
			optional: true,
			parse: String,
		},
		"item-id": {
			kind: "parsed",
			brief:
				"Return only the item with this unique ID. Returns at most one item.",
			optional: true,
			parse: String,
		},
		key: {
			kind: "parsed",
			brief:
				"Return only items with this exact key (object key / filename). Each key is unique within a source, so combine with `source` to disambiguate across data sources.",
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
				command: "ai-search items list",
				classification: {
					safeFlags: ["sort-by", "status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/items`,
						pathParams: {
							namespace: String(argv["namespace"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
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
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/items`,
						{ query: queryParams }
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
