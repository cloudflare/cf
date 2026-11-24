/**
 * list-submitted command
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
			brief: "Page of submitted reports to return.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of submitted reports per page.",
			optional: true,
			parse: Number,
		},
		sort: {
			kind: "parsed",
			brief:
				"A property and direction to sort by (id, cdate, domain, type, status).",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief: "Filter by report code.",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief:
				"Filter by reported domain. This parameter can be specified multiple times.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"created-before": {
			kind: "parsed",
			brief: "Return reports submitted before this time.",
			optional: true,
			parse: String,
		},
		"created-after": {
			kind: "parsed",
			brief: "Return reports submitted after this time.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Filter by submitter-facing status. This parameter can be specified multiple times.",
			variadic: true,
			optional: true,
			choices: ["submitted", "accepted", "denied"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		type: {
			kind: "parsed",
			brief:
				"Filter by report type. This parameter can be specified multiple times.",
			variadic: true,
			optional: true,
			choices: [
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
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
	command: "list-submitted",
	describe: "List submitted abuse reports",
	usage:
		"$0 abuse-reports list-submitted\n\nList abuse reports submitted by the account.",
	...parameters,
	loader: () => import("./list-submitted.handler.js"),
});

export default command;
