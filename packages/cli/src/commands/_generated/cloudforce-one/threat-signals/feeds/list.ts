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
		page: {
			kind: "parsed",
			brief: "1-based page number. Minimum 1; defaults to 1.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of feeds per page, from 1 to 100. Defaults to 20.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief:
				"Optional 1–100 alias for per_page. When provided, limit takes precedence.",
			optional: true,
			parse: Number,
		},
		sort: {
			kind: "parsed",
			brief:
				"Sort by created_at, title, category, or url. Prefix the field with - for descending order; defaults to -created_at.",
			optional: true,
			parse: String,
		},
		category: {
			kind: "parsed",
			brief:
				"Exact feed-category filter, up to 100 characters. Omit to include all categories.",
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
		enabled: {
			kind: "boolean",
			brief:
				"Filter by enabled state. Accepts true, false, 1, or 0; omit to include enabled and disabled feeds.",
			optional: true,
		},
		status: {
			kind: "parsed",
			brief:
				"Exact stored polling-status filter, such as active or error. Omit to include every status.",
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
	describe: "List Threat Signals feeds",
	usage:
		"$0 cloudforce-one threat-signals feeds list\n\nLists the account's Threat Signals feed subscriptions.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
