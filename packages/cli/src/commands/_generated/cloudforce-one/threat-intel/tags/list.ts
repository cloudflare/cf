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
				"Free-text substring match on tag value AND custom-field properties. Searches case-insensitively inside both `Tag.value` and the serialized `Tag.properties` JSON blob (keys, values, and annotation metadata like confidence/tlp are all searchable). Same serialized-text tradeoff as `aliasGroupNames` — substrings can cross JSON boundaries.",
			optional: true,
			parse: String,
		},
		"category-uuid": {
			kind: "parsed",
			brief: "CategoryUuid",
			optional: true,
			parse: String,
		},
		filters: {
			kind: "parsed",
			brief:
				'Structured filters as a JSON array of {field, op, value} objects. Searchable fields: uuid, value, categoryName, description, dateOfDiscovery, tlp, confidence, actorCategory, motive, attributionOrganization, originCountryISO, aliases, externalReferences, opsecLevel, sophisticationLevel, activeDuration, priority, lastSeen, aliasGroupNames. Operators: equals, not, contains, startsWith, endsWith, gt, lt, gte, lte, like, in, find. Use \'in\' for bulk OR within a single field, e.g. filters=[{"field":"originCountryISO","op":"in","value":["IR","CN"]}]. Multiple entries are AND-joined. Max 10 entries per request, max 100 values per \'in\'. Per-field notes: `uuid` accepts only \'equals\' and \'in\' (other operators throw ValidationError) — matched against the canonical lowercase storage but callers may pass either case (the server lowercases before comparison); index-backed by the column\'s UNIQUE constraint and intended for batched UUID → tag resolution. `originCountryISO` uses its B-tree index for equals/not/in. `priority` uses its B-tree index for numeric comparisons. Other string columns (`actorCategory`, `motive`, etc.) are case-insensitive and unindexed; current catalog size makes this a non-issue. `endsWith` and `aliasGroupNames` contains/like are leading-wildcard scans and slow on large result sets. `aliasGroupNames` matches on the JSON-encoded text, so substrings can cross alias boundaries (a search for "apt28" will also match "apt280" if both appear in the same tag\'s alias list).',
			variadic: true,
			optional: true,
			parse: String,
		},
		cache: {
			kind: "enum",
			brief:
				"Cache strategy. 'from-graph' serves results from the graph-node KV cache when all requested UUIDs are cached; falls back to normal path on partial/zero hit.",
			values: ["from-graph"],
			optional: true,
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
	describe: "List tags",
	usage:
		"$0 cloudforce-one threat-intel tags list\n\nLists the account's tags. Use `search` to match tag values, `categoryUuid` to limit results to one category, and `filters` (a JSON array) to filter by fields such as `originCountryISO`, `actorCategory`, `motive`, or `priority`. Country filters accept alpha-2 or alpha-3 codes, names, or common aliases. Tags marked TLP:PURPLE are visible only to Cloudforce One.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
