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
				"The beginning of the search date range. Defaults to `now - 30 days`.",
			optional: true,
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "The end of the search date range. Defaults to `now`.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "enum",
			brief:
				"Filter by who created the submission — `TEAM` for security team members or `USER` for end users.",
			values: ["TEAM", "USER"],
			optional: true,
		},
		"submission-id": {
			kind: "parsed",
			brief: "Filter by a specific submission ID.",
			optional: true,
			parse: String,
		},
		"original-disposition": {
			kind: "enum",
			brief: "The disposition a message is submitted to have.",
			values: ["MALICIOUS", "SUSPICIOUS", "SPOOF", "SPAM", "BULK", "NONE"],
			optional: true,
		},
		"requested-disposition": {
			kind: "enum",
			brief: "The disposition a message is submitted to have.",
			values: ["MALICIOUS", "SUSPICIOUS", "SPOOF", "SPAM", "BULK", "NONE"],
			optional: true,
		},
		"outcome-disposition": {
			kind: "enum",
			brief: "The disposition a message is submitted to have.",
			values: ["MALICIOUS", "SUSPICIOUS", "SPOOF", "SPAM", "BULK", "NONE"],
			optional: true,
		},
		status: {
			kind: "parsed",
			brief:
				"Filter by review status — `escalated`, `reviewed`, or `unreviewed`.",
			optional: true,
			parse: String,
		},
		query: {
			kind: "parsed",
			brief: "Search term for filtering submissions.",
			optional: true,
			parse: String,
		},
		"escalated-from-user": {
			kind: "boolean",
			brief:
				"When true, return only submissions that were escalated by an end user (vs. by the security team). When false, return only submissions that were not escalated by an end user. When omitted, no filter is applied.",
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Field to sort by.",
			values: [
				"submission_id",
				"subject",
				"original_disposition",
				"requested_disposition",
				"outcome_disposition",
				"requested_at",
			],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The sorting direction.",
			values: ["asc", "desc"],
			optional: true,
		},
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
	describe: "List reclassify submissions",
	usage:
		"$0 email-security submissions list\n\nReturns information for submissions made to reclassify emails. Shows the status, outcome, and disposition changes for reclassification requests made by users or the security team. Useful for tracking false positive/negative reports.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
