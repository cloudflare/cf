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
		start: {
			kind: "parsed",
			brief:
				"The beginning of the search date range. Defaults to `now - 30 days`. Must not be in the future.",
			optional: true,
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "The end of the search date range. Defaults to `now`.",
			optional: true,
			parse: String,
		},
		query: {
			kind: "parsed",
			brief:
				"Space-delimited term matched case-insensitively against message metadata — sender, recipient, subject, attachment names and hashes, and message ID.",
			optional: true,
			parse: String,
		},
		"detections-only": {
			kind: "boolean",
			brief: "Whether to include only detections in search results.",
			optional: true,
		},
		"final-disposition": {
			kind: "enum",
			brief: "Dispositions to filter by.",
			values: ["MALICIOUS", "SUSPICIOUS", "SPOOF", "SPAM", "BULK", "NONE"],
			optional: true,
		},
		metric: {
			kind: "parsed",
			brief: "Metric to aggregate the results by.",
			optional: true,
			parse: String,
		},
		"message-action": {
			kind: "enum",
			brief: "Message actions to filter by.",
			values: ["PREVIEW", "QUARANTINE_RELEASED", "MOVED"],
			optional: true,
		},
		recipient: {
			kind: "parsed",
			brief: "Filter by recipient. Matches an email address or a domain.",
			optional: true,
			parse: String,
		},
		sender: {
			kind: "parsed",
			brief: "Filter by sender. Matches an email address or a domain.",
			optional: true,
			parse: String,
		},
		"smtp-helo-ip": {
			kind: "parsed",
			brief:
				"Matches messages whose SMTP HELO server IP address equals this value.",
			optional: true,
			parse: String,
		},
		"alert-id": {
			kind: "parsed",
			brief: "Filter by alert ID.",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief:
				"Filter by a domain found in the email — sender domain, recipient domain, or a domain in a link.",
			optional: true,
			parse: String,
		},
		"message-id": {
			kind: "parsed",
			brief: "Filter by the RFC 5322 Message-ID header.",
			optional: true,
			parse: String,
		},
		subject: {
			kind: "parsed",
			brief:
				"Search for messages containing individual keywords in any order within the subject.",
			optional: true,
			parse: String,
		},
		"delivery-status": {
			kind: "enum",
			brief: "Delivery status to filter by.",
			values: [
				"delivered",
				"moved",
				"quarantined",
				"rejected",
				"deferred",
				"bounced",
				"queued",
				"move_failed",
			],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief: "Pagination cursor from the previous response's `result_info`.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief:
				"Deprecated: Use cursor pagination instead. End of life: November 1, 2026.",
			optional: true,
			parse: Number,
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
	describe: "Search email messages",
	usage:
		"$0 email-security investigate list\n\nReturns information for each email that matches the provided search parameters.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
