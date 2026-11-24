/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"project-type": { kind: "parsed", brief: "Project type", parse: String },
		"request-id": { kind: "parsed", brief: "Request ID", parse: String },
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
	describe: "Read a single message for an RFI request",
	usage:
		"$0 cloudforce-one requests messages get <message-id>\n\nReturns the details for a specific message belonging to an RFI request.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
