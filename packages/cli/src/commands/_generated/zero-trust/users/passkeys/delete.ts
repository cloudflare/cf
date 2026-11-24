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
		"user-id": { kind: "parsed", brief: "UUID.", parse: String },
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
			placeholder: "authenticator-id",
			brief: "The unique identifier for the MFA device.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <authenticator-id>",
	describe: "Delete a user's passkey",
	usage:
		"$0 zero-trust users passkeys delete <authenticator-id>\n\nAlias of the authenticator deletion endpoint for passkey management. The identifier is the passkey's authenticator ID from the last-seen identity response. Successful deletion revokes the enrollment and returns a null result.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
