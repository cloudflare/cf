/**
 * list command
 * @generated from apis/overlays/abuse-reports.ts
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
			brief: "Where in pagination to start listing abuse reports",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "How many abuse reports per page to list",
			optional: true,
			parse: Number,
		},
		sort: {
			kind: "parsed",
			brief:
				"A property to sort by, followed by the order (id, cdate, domain, type, status)",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Free-text search. Returns reports whose report ID starts with the term or whose domain contains the term, both case-insensitively. Surrounding whitespace is ignored, and an empty value is treated as absent. Combined with the other filters using AND.",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief: "Filter by domain name related to the abuse report",
			optional: true,
			parse: String,
		},
		"created-before": {
			kind: "parsed",
			brief: "Returns reports created before the specified date",
			optional: true,
			parse: String,
		},
		"created-after": {
			kind: "parsed",
			brief: "Returns reports created after the specified date",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter by the status of the report.",
			values: ["accepted", "in_review"],
			optional: true,
		},
		type: {
			kind: "enum",
			brief: "Filter by the type of the report.",
			values: [
				"PHISH",
				"GEN",
				"THREAT",
				"DMCA",
				"EMER",
				"TM",
				"REG_WHO",
				"NCSEI",
				"NETWORK",
			],
			optional: true,
		},
		"mitigation-status": {
			kind: "enum",
			brief: "Filter reports that have any mitigations in the given status.",
			values: ["pending", "active", "in_review", "cancelled", "removed"],
			optional: true,
		},
		"pending-notice": {
			kind: "boolean",
			brief:
				"Also include reports in an open Notice and Takedown notice period. Combined with mitigation_status using OR, e.g. ?mitigation_status=active&pending_notice=true.",
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
	describe: "List abuse reports against the account",
	usage:
		"$0 abuse-reports list\n\nList abuse reports made against domains or other content associated with the account. To list reports that the account submitted, use the submitted abuse reports endpoint instead.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
