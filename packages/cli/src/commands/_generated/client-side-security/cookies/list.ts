/**
 * list command
 * @generated from apis/overlays/client-side-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		hosts: {
			kind: "parsed",
			brief:
				"Includes cookies that match one or more URL-encoded hostnames separated by commas.\n\nWildcards are supported at the start and end of each hostname to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				'The current page number of the paginated results.\n\nWe additionally support a special value "all". When "all" is used, the API will return all the cookies\nwith the applied filters in a single page. This feature is best-effort and it may only work for zones with\na low number of cookies',
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page.",
			optional: true,
			parse: Number,
		},
		"order-by": {
			kind: "enum",
			brief: "The field used to sort returned cookies.",
			values: ["first_seen_at", "last_seen_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The direction used to sort returned cookies.'",
			values: ["asc", "desc"],
			optional: true,
		},
		"page-url": {
			kind: "parsed",
			brief:
				"Includes connections that match one or more page URLs (separated by commas) where they were last seen\n\nWildcards are supported at the start and end of each page URL to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
			optional: true,
			parse: String,
		},
		export: {
			kind: "enum",
			brief: "Export the list of cookies as a file, limited to 50000 entries.",
			values: ["csv"],
			optional: true,
		},
		name: {
			kind: "parsed",
			brief:
				"Filters the returned cookies that match the specified name.\nWildcards are supported at the start and end to support starts with, ends with\nand contains. e.g. session*",
			optional: true,
			parse: String,
		},
		secure: {
			kind: "boolean",
			brief: "Filters the returned cookies that are set with Secure",
			optional: true,
		},
		"http-only": {
			kind: "boolean",
			brief: "Filters the returned cookies that are set with HttpOnly",
			optional: true,
		},
		"same-site": {
			kind: "enum",
			brief:
				"Filters the returned cookies that match the specified same_site attribute",
			values: ["lax", "strict", "none"],
			optional: true,
		},
		type: {
			kind: "enum",
			brief:
				"Filters the returned cookies that match the specified type attribute",
			values: ["first_party", "unknown"],
			optional: true,
		},
		path: {
			kind: "parsed",
			brief:
				"Filters the returned cookies that match the specified path attribute",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief:
				"Filters the returned cookies that match the specified domain attribute",
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
	describe: "List detected cookies",
	usage:
		"$0 client-side-security cookies list\n\nLists cookies detected on the zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
