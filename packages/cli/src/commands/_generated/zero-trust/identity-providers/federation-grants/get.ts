/**
 * get command
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
	command: "get <grant-id>",
	describe: "Get an IdP federation grant",
	usage:
		"$0 zero-trust identity-providers federation-grants get <grant-id>\n\nRetrieves a single IdP federation grant by its UID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
