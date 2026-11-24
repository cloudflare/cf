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
			placeholder: "grant-id",
			brief: "UID of the IdP federation grant.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <grant-id>",
	describe: "Delete an IdP federation grant",
	usage:
		"$0 zero-trust identity-providers federation-grants delete <grant-id>\n\nDeletes an IdP federation grant. The identity provider remains in the account, but it is no longer available for federation to other accounts.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
