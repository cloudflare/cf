/**
 * get command
 * @generated from apis/overlays/email-sending.ts
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
		{
			placeholder: "suppression-id",
			brief: "The suppression's identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <suppression-id>",
	describe: "Get account Email Sending suppression",
	usage:
		"$0 email-sending suppressions get <suppression-id>\n\nGets an Email Sending suppression owned by the account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
