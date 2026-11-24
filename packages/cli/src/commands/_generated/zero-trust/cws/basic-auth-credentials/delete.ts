/**
 * delete command
 * @generated from apis/overlays/zero-trust.ts
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
			placeholder: "credential-id",
			brief: "ID of the credential to delete",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <credential-id>",
	describe: "Delete a basic-auth credential",
	usage:
		"$0 zero-trust cws basic-auth-credentials delete <credential-id>\n\nDeletes the credential and its secrets if it is not attached to a deployment.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
