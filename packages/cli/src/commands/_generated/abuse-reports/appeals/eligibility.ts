/**
 * eligibility command
 * @generated from apis/overlays/abuse-reports.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "report-id", brief: "Abuse Report ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "eligibility <report-id>",
	describe: "Check whether a report can be appealed",
	usage:
		"$0 abuse-reports appeals eligibility <report-id>\n\nReturns whether the report is currently appealable, along with the signals behind that decision: whether it already has an open appeal, how many appeals have been submitted against it, and whether it has at least one mitigation that an appeal could reverse. Report-level appeals are currently available only for DMCA (copyright) reports. For other report types this operation returns the same `404 Report not found` response as a report that does not exist for the account.",
	...parameters,
	loader: () => import("./eligibility.handler.js"),
});

export default command;
