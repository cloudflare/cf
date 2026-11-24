/**
 * get-submitted command
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
		{ placeholder: "report-id", brief: "Public report code.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-submitted <report-id>",
	describe: "Get a submitted abuse report",
	usage:
		"$0 abuse-reports get-submitted <report-id>\n\nRetrieve a report submitted by the account.",
	...parameters,
	loader: () => import("./get-submitted.handler.js"),
});

export default command;
