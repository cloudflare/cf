/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"feed-id": {
			kind: "parsed",
			brief:
				"Feed UUID filter. Omit to include indicators from every account feed.",
			optional: true,
			parse: String,
		},
		"article-id": {
			kind: "parsed",
			brief:
				"Article UUID filter. Omit to include indicators from every article.",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"NFC-normalized and trimmed, case-insensitive literal substring search of indicator values. Requires 3–500 Unicode code points; the upper code-point bound is described here because OpenAPI string length cannot precisely express it without imposing UTF-16 semantics.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of indicators per cursor page, from 1 to 100. Defaults to 20.",
			optional: true,
			parse: Number,
		},
		sort: {
			kind: "parsed",
			brief:
				"Sort by id. Use id for ascending or -id for descending order; defaults to id.",
			optional: true,
			parse: String,
		},
		"include-total": {
			kind: "boolean",
			brief:
				"When true on the first page, count matching indicators and return an exact total. Defaults to false; cursor pages do not recalculate totals.",
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from the previous response's `pagination.cursor`. When provided, page size, ordering, and filters come from the cursor. Sending `per_page`, `sort`, `include_total`, `feed_id`, `article_id`, or `search` alongside it returns a 400 `CursorFilterConflictError`.",
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
	describe: "List Threat Signals article indicators",
	usage:
		"$0 cloudforce-one threat-signals indicators list\n\nLists indicators of compromise extracted from the account's Threat Signals articles.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
