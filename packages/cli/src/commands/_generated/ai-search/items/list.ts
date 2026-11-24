/**
 * list command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "Items List.",
	usage:
		"$0 ai-search items list\n\nLists indexed items in an AI Search instance.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
