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
		"report-id": { kind: "parsed", brief: "Abuse Report ID", parse: String },
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
			kind: "enum",
			brief: "A property to sort by, followed by the order",
			values: [
				"type,asc",
				"type,desc",
				"effective_date,asc",
				"effective_date,desc",
				"status,asc",
				"status,desc",
				"entity_type,asc",
				"entity_type,desc",
			],
			optional: true,
		},
		type: {
			kind: "parsed",
			brief:
				"Filter by the type of mitigation. This filter parameter can be specified multiple times to include multiple types of mitigations in the result set.",
			optional: true,
			parse: String,
		},
		"effective-before": {
			kind: "parsed",
			brief: "Returns mitigations that were dispatched before the given date",
			optional: true,
			parse: String,
		},
		"effective-after": {
			kind: "parsed",
			brief: "Returns mitigation that were dispatched after the given date",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter by the status of the mitigation.",
			values: ["pending", "active", "in_review", "cancelled", "removed"],
			optional: true,
		},
		"entity-type": {
			kind: "enum",
			brief: "Filter by the type of entity the mitigation impacts.",
			values: ["url_pattern", "account", "zone", "domain", "custom_expression"],
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
	describe: "List abuse report mitigations",
	usage:
		"$0 abuse-reports mitigations list\n\nList mitigations done to remediate the abuse report.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
