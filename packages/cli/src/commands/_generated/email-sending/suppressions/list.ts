/**
 * list command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of suppressions to return per page.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque pagination cursor returned as `result_info.next_cursor`. It carries the filters that produced it.",
			optional: true,
			parse: String,
		},
		email: {
			kind: "parsed",
			brief: "Exact email-address filter.",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"A complete address is an exact match; a value ending in `@` matches that username across every domain. Prefix searches may return short intermediate pages while the bounded account scan advances.",
			optional: true,
			parse: String,
		},
		reason: {
			kind: "enum",
			brief: "Filter to suppressions with this reason.",
			values: ["manual", "complaint", "hard_bounce", "soft_bounce", "policy"],
			optional: true,
		},
		"scope-type": {
			kind: "enum",
			brief:
				"Filter by scope: `account` returns only account-wide suppressions, `sending_domain` only sending-domain suppressions. Omit to list both; the order between the two scopes is not fixed.",
			values: ["account", "sending_domain"],
			optional: true,
		},
		"scope-value": {
			kind: "parsed",
			brief:
				"Exact sending-domain filter. Requires `scope_type=sending_domain`.",
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
	describe: "List account Email Sending suppressions",
	usage:
		"$0 email-sending suppressions list\n\nLists every active Email Sending suppression owned by the account: sending-domain suppressions and account-wide suppressions. Each scope is listed newest first. The order between sending-domain and account-wide suppressions is not fixed; use `scope_type` to list one scope.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
