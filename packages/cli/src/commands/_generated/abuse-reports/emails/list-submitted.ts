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
			brief: "Page number to retrieve (default 1).",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of emails per page (default 20, max 100).",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "report-id", brief: "Public report code.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list-submitted <report-id>",
	describe: "List emails sent to an abuse report submitter",
	usage:
		"$0 abuse-reports emails list-submitted <report-id>\n\nList successful emails sent to the submitter of a report submitted by the account. Does not include emails sent to customers or hosts.",
	...parameters,
	loader: () => import("./list-submitted.handler.js"),
});

export default command;
