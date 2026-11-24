/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <suppression-id>",
	describe: "Delete account Email Sending suppression",
	usage:
		"$0 email-sending suppressions delete <suppression-id>\n\nDeletes the suppression and its note, allowing future delivery attempts to the address.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
