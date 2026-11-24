/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"expires-at": {
			kind: "parsed",
			brief:
				"Optional deactivation deadline (RFC 3339). Omit or null for no expiry.",
			optional: true,
			parse: String,
		},
		password: {
			kind: "parsed",
			brief:
				"Password stored only as a one-way hash and never returned. Maximum 72 UTF-8 bytes.",
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
	operands: [
		{
			placeholder: "credential-id",
			brief: "ID of the parent credential",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <credential-id>",
	describe: "Add a secret to a basic-auth credential",
	usage:
		"$0 zero-trust cws basic-auth-credentials secrets create <credential-id>\n\nAdds a password secret to the credential.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
