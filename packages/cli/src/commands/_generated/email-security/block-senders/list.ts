/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief: "Search term for filtering records. Behavior may change.",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Field to sort by.",
			values: ["pattern", "created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
			values: ["asc", "desc"],
			optional: true,
		},
		"pattern-type": {
			kind: "enum",
			brief: "Filter by pattern type.",
			values: ["EMAIL", "DOMAIN", "IP", "UNKNOWN"],
			optional: true,
		},
		pattern: {
			kind: "parsed",
			brief: "Filter by pattern value.",
			optional: true,
			parse: String,
		},
		expired: {
			kind: "boolean",
			brief:
				"Filter to return only expired patterns (`true`) or only patterns that still apply (`false`). Omit to return both.",
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
	describe: "List blocked email senders",
	usage:
		"$0 email-security block-senders list\n\nReturns a paginated list of blocked email sender patterns. These patterns prevent emails from matching senders from being delivered. Supports filtering by pattern type and searching across patterns.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
