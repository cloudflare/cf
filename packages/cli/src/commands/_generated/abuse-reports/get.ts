/**
 * get command
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
		{ placeholder: "report-id", brief: "Public report ID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <report-id>",
	describe: "Get an abuse report against the account",
	usage:
		"$0 abuse-reports get <report-id>\n\nRetrieve the details of an abuse report made against a domain or other content associated with the account. To retrieve a report that the account submitted, use the submitted abuse report endpoint instead.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
