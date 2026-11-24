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
		"dataset-ids": {
			kind: "parsed",
			brief:
				"Dataset UUIDs to scope to (repeat the param for multiple), or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Analytics datasets do not expose tag associations, so 'analytics' returns an empty result. Omit for 'all'.",
			variadic: true,
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number (default 1). page × pageSize may not exceed 10000.",
			optional: true,
			parse: Number,
		},
		"page-size": {
			kind: "parsed",
			brief:
				"Results per page (default 100, maximum 1000; larger values are clamped).",
			optional: true,
			parse: Number,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "IndicatorType",
			optional: true,
			parse: String,
		},
		"related-event": {
			kind: "parsed",
			brief:
				"Filter indicators by related event UUID(s). Multiple UUIDs can be provided by repeating the parameter.",
			variadic: true,
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Structured search as a JSON array of {field, op, value} objects. Searchable fields: value, indicatorType. Multiple conditions are AND'd together. Max 10 conditions per request.",
			variadic: true,
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
	describe: "List a tag's indicators",
	usage:
		"$0 cloudforce-one threat-intel tags indicators list\n\nLists the indicators that carry a tag, with pagination. By default, every intelligence dataset you can read is searched; use `datasetIds` to limit the search to specific datasets or a scope value. Analytics datasets don't store tag associations, so the `analytics` scope returns no results.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
