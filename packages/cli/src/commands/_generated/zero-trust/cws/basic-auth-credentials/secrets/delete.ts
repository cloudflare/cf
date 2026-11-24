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
		"credential-id": {
			kind: "parsed",
			brief: "ID of the parent credential",
			parse: String,
		},
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
			placeholder: "secret-id",
			brief: "ID of the secret to delete",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <secret-id>",
	describe: "Delete a basic-auth secret",
	usage:
		"$0 zero-trust cws basic-auth-credentials secrets delete <secret-id>\n\nDeletes the specified secret from the credential.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
