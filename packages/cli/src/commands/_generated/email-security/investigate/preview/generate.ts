/**
 * generate command
 * @generated from apis/overlays/email-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		id: {
			kind: "parsed",
			brief: "Unique identifier for a message retrieved from investigation.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "generate",
	describe: "Generate preview for a non-detection message",
	usage:
		"$0 email-security investigate preview generate\n\nGenerates a preview image for a message that was not flagged as a detection. The message is rendered from the copy in the recipient's mailbox, so this requires an active integration and only works while the message is still in the recipient's inbox. Returns a base64-encoded PNG screenshot of the email body. For messages with a detection, use the detection preview endpoint instead.",
	...parameters,
	loader: () => import("./generate.handler.js"),
});

export default command;
