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
		"tag-uuid": { kind: "parsed", brief: "Tag UUID.", parse: String },
		datasets: {
			kind: "parsed",
			brief:
				"Comma-separated dataset UUIDs to scope to, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Analytics datasets do not expose tag associations, so 'analytics' returns an empty result. Omit for 'all'.",
			variadic: true,
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"JSON array of {field, op, value} filters (same as indicator list search).",
			variadic: true,
			optional: true,
			parse: String,
		},
		expand: {
			kind: "parsed",
			brief: "Comma-separated entity types to hydrate (event, indicator, tag).",
			variadic: true,
			optional: true,
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from a previous page. Results are ordered by createdAt ascending. Cursors in an older format are rejected; restart without a cursor.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief: "Page size (1–100, default 25).",
			optional: true,
			parse: Number,
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
	describe: "List tag relationships",
	usage:
		"$0 cloudforce-one threat-intel tags relationships list\n\nLists the relationships that start at a tag, across the intelligence datasets you can read. Use `datasets` to limit the datasets (`all` and `operational` are equivalent here) and `expand` to include the related entities. Analytics datasets don't store tag associations, so the `analytics` scope returns no results.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
