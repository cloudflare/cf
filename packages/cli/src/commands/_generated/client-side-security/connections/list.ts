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
		"exclude-urls": {
			kind: "parsed",
			brief:
				"Excludes connections whose URL contains one of the URL-encoded URLs separated by commas.",
			optional: true,
			parse: String,
		},
		urls: {
			kind: "parsed",
			brief:
				"Includes connections whose URL contain one or more URL-encoded URLs separated by commas.",
			optional: true,
			parse: String,
		},
		hosts: {
			kind: "parsed",
			brief:
				"Includes connections that match one or more URL-encoded hostnames separated by commas.\n\nWildcards are supported at the start and end of each hostname to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				'The current page number of the paginated results.\n\nWe additionally support a special value "all". When "all" is used, the API will return all the connections\nwith the applied filters in a single page. This feature is best-effort and it may only work for zones with\na low number of connections',
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
			brief: "The field used to sort returned connections.",
			values: ["first_seen_at", "last_seen_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The direction used to sort returned connections.",
			values: ["asc", "desc"],
			optional: true,
		},
		"prioritize-malicious": {
			kind: "boolean",
			brief:
				"When true, malicious connections appear first in the returned connections.",
			optional: true,
		},
		"exclude-cdn-cgi": {
			kind: "boolean",
			brief:
				"When true, excludes connections seen in a `/cdn-cgi` path from the returned connections. The default value is true.",
			optional: true,
		},
		status: {
			kind: "parsed",
			brief:
				"Filters the returned connections using a comma-separated list of connection statuses. Accepted values: `active`, `infrequent`, and `inactive`. The default value is `active`.",
			optional: true,
			parse: String,
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
			brief:
				"Export the list of connections as a file, limited to 50000 entries.",
			values: ["csv"],
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
	describe: "List detected connections",
	usage:
		"$0 client-side-security connections list\n\nLists outbound connections made by webpages in the zone.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
