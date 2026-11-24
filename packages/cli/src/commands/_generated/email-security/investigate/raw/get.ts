/**
 * get command
 * @generated from apis/overlays/email-security.ts
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
			placeholder: "investigate-id",
			brief: "Unique identifier for a message retrieved from investigation.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <investigate-id>",
	describe: "Get raw email content",
	usage:
		"$0 email-security investigate raw get <investigate-id>\n\nReturns the raw EML content of any message with a detection.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
