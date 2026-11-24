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
	operands: [{ placeholder: "message-id", brief: "Message ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <message-id>",
	describe: "Fetch an email message",
	usage:
		"$0 email-sending get <message-id>\n\nReturns the raw RFC 5322 MIME message for the given account and message id.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
