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
		value: {
			kind: "parsed",
			brief: "Free-text substring match on actor name (Tag.value).",
			optional: true,
			parse: String,
		},
		filters: {
			kind: "parsed",
			brief:
				'Structured filters as a JSON array of {field, op, value} objects. Same shape as the events search API. Common use: filter actors by country with filters=[{"field":"originCountryISO","op":"in","value":["IR","CN"]}]. Country values may be passed as alpha-2, alpha-3, name, or alias (e.g. "iran"). Max 10 entries per request, max 100 values per \'in\'. Accounts other than the catalog owner may only filter on fields that are also public-readable (`uuid`, `value`, `categoryName`, `aliasGroupNames`, `originCountryISO`); filtering on a redacted field returns 400. `uuid` filters accept only the `equals` and `in` operators. Performance notes: `originCountryISO` uses its B-tree index for equals/in. `endsWith` and `aliasGroupNames` contains/like are leading-wildcard scans and slow on large result sets. `aliasGroupNames` matches on JSON-encoded text, so substrings can cross alias boundaries ("apt28" also matches "apt280" when both appear in the same tag\'s alias list).',
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
	describe: "List threat actors",
	usage:
		"$0 cloudforce-one threat-intel tags actors list\n\nLists threat actors from the Cloudforce One actor catalog. Use `value` to match actor names and `filters` to filter by fields such as origin country. Accounts outside Cloudforce One receive only public fields: identity, description, discovery date, TLP, confidence, custom properties, origin country, public aliases, and external references. Fields such as internal aliases, attribution, motive, and OPSEC level are omitted.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
