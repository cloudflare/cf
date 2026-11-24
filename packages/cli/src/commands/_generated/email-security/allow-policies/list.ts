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
		"is-exempt-recipient": {
			kind: "boolean",
			brief:
				"Filter to show only policies where messages to the recipient bypass all detections.",
			optional: true,
		},
		"is-trusted-sender": {
			kind: "boolean",
			brief:
				"Filter to show only policies where messages from the sender bypass all detections and link following.",
			optional: true,
		},
		"is-acceptable-sender": {
			kind: "boolean",
			brief:
				"Filter to show only policies where messages from the sender are exempted from Spam, Spoof, and Bulk dispositions (not Malicious or Suspicious).",
			optional: true,
		},
		"verify-sender": {
			kind: "boolean",
			brief:
				"Filter to show only policies that enforce DMARC, SPF, or DKIM authentication.",
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
			brief: "Filter by exact pattern value.",
			optional: true,
			parse: String,
		},
		expired: {
			kind: "boolean",
			brief:
				"Filter to return only expired policies (`true`) or only policies that still apply (`false`). Omit to return both.",
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
	describe: "List email allow policies",
	usage:
		"$0 email-security allow-policies list\n\nReturns a paginated list of email allow policies. These policies exempt matching emails from security detection, allowing them to bypass disposition actions. Supports filtering by pattern type and policy attributes.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
