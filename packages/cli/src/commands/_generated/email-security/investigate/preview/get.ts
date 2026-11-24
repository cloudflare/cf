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
	describe: "Get preview for a detection",
	usage:
		"$0 email-security investigate preview get <investigate-id>\n\nReturns a preview of the message body as a base64-encoded PNG image for any message with a detection. For messages without a detection, use the non-detection preview endpoint instead.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
