/**
 * search command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"force-refresh": { kind: "boolean", brief: "ForceRefresh", optional: true },
		format: {
			kind: "enum",
			brief:
				"Output format for event data. 'json' returns the default format, 'stix2' returns STIX 2.1 Sighting SROs with linked Indicator SDOs, Observed Data SDOs, and SCOs, 'taxii' returns a TAXII 2.1 Envelope with Content-Type application/taxii+json;version=2.1.",
			values: ["json", "stix2", "taxii"],
			optional: true,
		},
		cache: {
			kind: "enum",
			brief:
				"Cache strategy. 'from-graph' serves results from the graph-node KV cache when all requested UUIDs are cached; falls back to normal path on partial/zero hit.",
			values: ["from-graph"],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Cursor for pagination. When provided, filters are embedded in the cursor so you only need to pass cursor and pageSize.",
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief:
				"Dataset UUIDs to query, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Scope values query at most 50 datasets. If not provided, uses the default dataset.",
			variadic: true,
			optional: true,
			parse: String,
		},
		order: {
			kind: "parsed",
			brief: "The order field",
			optional: true,
			choices: ["asc", "desc"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "order", "text"),
		},
		"order-by": {
			kind: "parsed",
			brief: "The orderBy field",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "The page field",
			optional: true,
			parse: Number,
		},
		"page-size": {
			kind: "parsed",
			brief: "The pageSize field",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief:
				'Structured search as a JSON array of {field, op, value} objects, AND\'d together. Max 10 conditions per request. `in` and `notIn` take an array of up to 100 values. `containsAny` takes an array of up to 50 strings and matches when the field contains any of them; it is not supported for `indicator`, `date`, `killChain`, or `hasChildren`. Exclusions: `not` drops events without a value for the field; `notIn` and `notContains` keep them. On intelligence datasets, a `notIn` list containing `"unknown"` also drops them; analytics datasets treat `"unknown"` as a literal value. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"field": "attacker" | "attackerCountry" | "category" | ...more, "op": "equals" | "not" | "gt" | ...more, "value": string} | ...more)].',
			optional: true,
			parse: String,
		},
		"search-branches": {
			kind: "parsed",
			brief:
				'OR branches of structured search filters. Filters within a branch are AND\'d, branches are OR\'d, and the result is AND\'d with `search`: `AND(search) AND OR(AND(branch 1), ...)`. Max 8 branches of 1-10 conditions each. Not supported for analytics datasets, and `indicator` filters are not yet supported inside branches. Cursor pages carry the original branches, so do not resend them with `cursor`. Provide as a JSON array of arrays or @path/to/file.json. Shape: [[({"field": "attacker" | "attackerCountry" | "category" | ...more, "op": "equals" | "not" | "gt" | ...more, "value": string} | ...more)]].',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "search",
	describe: "Search events",
	usage:
		"$0 cloudforce-one threat-intel events search\n\nLists events, with filters sent in a JSON request body. Accepts the same filters as `threat-intel events list` and suits long or complex `search` filters. `datasetId` accepts dataset UUIDs or one scope value used alone: `all` (or `*`) and `operational` select the intelligence datasets you can read, and `analytics` selects the analytics datasets you can read. A scope value covers at most 50 datasets. Without `datasetId`, the default Cloudforce One Threat Events dataset is used.",
	...parameters,
	loader: () => import("./search.handler.js"),
});

export default command;
