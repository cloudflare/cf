/**
 * get-complaints command
 * @generated from apis/overlays/email-sending.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"start-at": { kind: "parsed", brief: "Start at", parse: String },
		"end-at": { kind: "parsed", brief: "End at", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "subdomain-id",
			brief: "Sending subdomain identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-complaints <subdomain-id>",
	describe: "Get sending subdomain complaint count",
	usage:
		"$0 email-sending subdomains reputation get-complaints <subdomain-id>\n\nReturns the matched complaint count for a sending subdomain in a half-open time window of up to seven days.",
	...parameters,
	loader: () => import("./get-complaints.handler.js"),
});

export default command;
