/**
 * get command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		offset: {
			kind: "parsed",
			brief: "Number of matches to skip, for pagination. Defaults to 0.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of matches to return. Defaults to 50.",
			optional: true,
			parse: String,
		},
		"query-id": {
			kind: "parsed",
			brief:
				"ID of a domain query, or a comma-separated list of domain query IDs. When you pass several IDs, matches are deduplicated by domain and each match includes a `match_details` array with per-query metadata and dismissed state.",
			variadic: true,
			parse: String,
		},
		"include-domain-id": {
			kind: "parsed",
			brief:
				"Set to `true` to include `domain_id` on each match. Required to dismiss or undismiss a match. Defaults to `false`.",
			optional: true,
			parse: String,
		},
		"include-dismissed": {
			kind: "parsed",
			brief:
				"Set to `false` to exclude dismissed matches. Dismissed matches are included when this is omitted or `true`.",
			optional: true,
			parse: String,
		},
		"domain-search": {
			kind: "parsed",
			brief:
				"Return only matches whose domain contains this text (case-insensitive).",
			optional: true,
			parse: String,
		},
		quality: {
			kind: "enum",
			brief: "Filter matches by quality. Options: 'high' or 'low'",
			values: ["high", "low"],
			optional: true,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Field to sort by: `domain`, `first_seen`, or `registrar`. Defaults to `first_seen`.",
			values: ["domain", "first_seen", "registrar"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief:
				"Sort direction: `asc` or `desc`. Defaults to `desc`. For single-query requests, `asc` applies only when `orderBy` is set.",
			values: ["asc", "desc"],
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
	command: "get",
	describe: "List domain matches",
	usage:
		"$0 brand-protection matches get\n\nLists domains that matched one or more saved domain queries, most recently matched first by default. When you pass several comma-separated `query_id` values, matches are deduplicated by domain and each match includes a `match_details` array with per-query dismissed state. Set `include_domain_id=true` to get the `domain_id` needed to dismiss or undismiss a match.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
