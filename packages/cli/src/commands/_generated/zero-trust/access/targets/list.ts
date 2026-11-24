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
		hostname: {
			kind: "parsed",
			brief: "Hostname of a target",
			optional: true,
			parse: String,
		},
		"hostname-contains": {
			kind: "parsed",
			brief: "Partial match to the hostname of a target",
			optional: true,
			parse: String,
		},
		"virtual-network-id": {
			kind: "parsed",
			brief: "Private virtual network identifier of the target",
			optional: true,
			parse: String,
		},
		"ip-v4": {
			kind: "parsed",
			brief: "IPv4 address of the target",
			optional: true,
			parse: String,
		},
		"ip-v6": {
			kind: "parsed",
			brief: "IPv6 address of the target",
			optional: true,
			parse: String,
		},
		"created-before": {
			kind: "parsed",
			brief: "Date and time at which the target was created before (inclusive)",
			optional: true,
			parse: String,
		},
		"created-after": {
			kind: "parsed",
			brief: "Date and time at which the target was created after (inclusive)",
			optional: true,
			parse: String,
		},
		"modified-before": {
			kind: "parsed",
			brief:
				"Date and time at which the target was modified before (inclusive)",
			optional: true,
			parse: String,
		},
		"modified-after": {
			kind: "parsed",
			brief: "Date and time at which the target was modified after (inclusive)",
			optional: true,
			parse: String,
		},
		ips: {
			kind: "parsed",
			brief:
				"Filters for targets that have any of the following IP addresses. Specify\n`ips` multiple times in query parameter to build list of candidates.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"target-ids": {
			kind: "parsed",
			brief:
				"Filters for targets that have any of the following UUIDs. Specify\n`target_ids` multiple times in query parameter to build list of\ncandidates.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ip-like": {
			kind: "parsed",
			brief:
				"Filters for targets whose IP addresses look like the specified string.\nSupports `*` as a wildcard character",
			optional: true,
			parse: String,
		},
		"ipv4-start": {
			kind: "parsed",
			brief:
				"Defines an IPv4 filter range's starting value (inclusive). Requires\n`ipv4_end` to be specified as well.",
			optional: true,
			parse: String,
		},
		"ipv4-end": {
			kind: "parsed",
			brief:
				"Defines an IPv4 filter range's ending value (inclusive). Requires\n`ipv4_start` to be specified as well.",
			optional: true,
			parse: String,
		},
		"ipv6-start": {
			kind: "parsed",
			brief:
				"Defines an IPv6 filter range's starting value (inclusive). Requires\n`ipv6_end` to be specified as well.",
			optional: true,
			parse: String,
		},
		"ipv6-end": {
			kind: "parsed",
			brief:
				"Defines an IPv6 filter range's ending value (inclusive). Requires\n`ipv6_start` to be specified as well.",
			optional: true,
			parse: String,
		},
		tag: {
			kind: "parsed",
			brief:
				"Filter by tag key:value pairs. Multiple `tag` params are AND'd.\nFormat: `tag=key:value` (e.g., `tag=environment:production`).\nKey and value must both be non-empty; `tag=:value` and `tag=key:` return 400.",
			variadic: true,
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Current page in the response",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Max amount of entries returned per page",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "The field to sort by.",
			values: ["hostname", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
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
	command: "list",
	describe: "List all targets",
	usage:
		"$0 zero-trust access targets list\n\nLists and sorts an account's targets. Filters are optional and are ANDed together.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
