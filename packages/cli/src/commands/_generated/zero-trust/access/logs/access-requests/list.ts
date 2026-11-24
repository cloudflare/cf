/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		limit: {
			kind: "parsed",
			brief: "The maximum number of log entries to retrieve.",
			optional: true,
			parse: Number,
		},
		direction: {
			kind: "enum",
			brief: "The chronological sorting order for the logs.",
			values: ["desc", "asc"],
			optional: true,
		},
		since: {
			kind: "parsed",
			brief: "The earliest event timestamp to query.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief: "The latest event timestamp to query.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		email: {
			kind: "parsed",
			brief:
				"Filter by user email. Match mode is controlled by `emailOp` (preferred) or the legacy `email_exact` flag.\n- Default (no `emailOp`, `email_exact=false` or unset): substring match — `email=@example.com` returns all events with that domain.\n- Exact match: set `emailOp=eq` (preferred) or `email_exact=true` — e.g. `email=user@example.com&email_exact=true` returns only that user.\n- Explicit substring match: set `emailOp=contains` (without `email_exact=true`). When both are set, `email_exact=true` takes precedence and the match is exact.\n- Exclusion: set `emailOp=neq`. With `email_exact=true` this is an exact-value exclusion; without it, a fuzzy substring exclusion.",
			optional: true,
			parse: String,
		},
		"email-exact": {
			kind: "boolean",
			brief:
				"When true, `email` is matched exactly instead of substring matching.",
			optional: true,
		},
		"user-id": {
			kind: "parsed",
			brief:
				"Deprecated. Accepted for backward compatibility but no longer applied\nas a filter. Use `email` instead.",
			optional: true,
			parse: String,
		},
		"allowed-op": {
			kind: "enum",
			brief: "Operator for the `allowed` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"country-code-op": {
			kind: "enum",
			brief: "Operator for the `country_code` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"app-type-op": {
			kind: "enum",
			brief: "Operator for the `app_type` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"app-uid-op": {
			kind: "enum",
			brief: "Operator for the `app_uid` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"ray-id-op": {
			kind: "enum",
			brief: "Operator for the `ray_id` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"email-op": {
			kind: "enum",
			brief:
				"Operator for the `email` filter.\n`contains` performs a substring (case-sensitive) match. When `email_exact=true`\nis also set, `email_exact` takes precedence and `contains` is ignored.",
			values: ["eq", "neq", "contains"],
			optional: true,
		},
		"idp-op": {
			kind: "enum",
			brief: "Operator for the `idp` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"non-identity-op": {
			kind: "enum",
			brief: "Operator for the `non_identity` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"user-id-op": {
			kind: "enum",
			brief:
				"Deprecated. Accepted for backward compatibility but no longer applied\nas a filter (the `user_id` parameter is itself deprecated).",
			values: ["eq", "neq"],
			optional: true,
		},
		fields: {
			kind: "parsed",
			brief:
				"Comma-separated list of fields to include in the response.\nWhen omitted, all fields are returned.",
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
	describe: "Get Access authentication logs",
	usage:
		"$0 zero-trust access logs access-requests list\n\nGets a list of Access authentication audit logs for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
