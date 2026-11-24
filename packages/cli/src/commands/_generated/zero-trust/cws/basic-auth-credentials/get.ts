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
			placeholder: "credential-id",
			brief: "ID of the credential to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <credential-id>",
	describe: "Get a basic-auth credential by ID",
	usage:
		"$0 zero-trust cws basic-auth-credentials get <credential-id>\n\nReturns the basic-auth credential with the specified ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
