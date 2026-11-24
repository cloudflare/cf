/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "pattern-id",
			brief: "Blocked sender pattern identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <pattern-id>",
	describe: "Delete a blocked email sender",
	usage:
		"$0 email-security block-senders delete <pattern-id>\n\nRemoves a blocked sender pattern. After deletion, emails from this sender will no longer be automatically blocked based on this rule.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
