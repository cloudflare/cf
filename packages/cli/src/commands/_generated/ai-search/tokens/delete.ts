/**
 * delete command
 * @generated from apis/overlays/ai-search.ts
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
			placeholder: "token-id",
			brief: "Stored credential record ID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <token-id>",
	describe: "Delete a token",
	usage:
		"$0 ai-search tokens delete <token-id>\n\nDeletes a stored AI Search credential permanently. Credentials in use by an instance cannot be deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
