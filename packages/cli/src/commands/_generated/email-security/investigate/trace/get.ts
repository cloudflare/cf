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
	describe: "Get email trace",
	usage:
		"$0 email-security investigate trace get <investigate-id>\n\nRetrieves delivery and processing trace information for an email message. Shows the delivery path, retraction history, and move operations performed on the message. Useful for debugging delivery issues.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
