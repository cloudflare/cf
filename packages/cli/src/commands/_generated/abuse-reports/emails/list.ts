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
			brief: "Page number to retrieve (default 1)",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of emails per page (default 20, max 100)",
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
	describe: "List abuse report emails",
	usage:
		"$0 abuse-reports emails list\n\nList emails sent to the customer for an abuse report. Returns all successful customer emails sent for the specified abuse report. Does not include emails sent to hosts or submitters.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
