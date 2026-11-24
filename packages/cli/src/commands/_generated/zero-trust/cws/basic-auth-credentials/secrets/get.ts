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
	},
	operands: [
		{
			placeholder: "secret-id",
			brief: "ID of the secret to retrieve",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <secret-id>",
	describe: "Get a basic-auth secret by ID",
	usage:
		"$0 zero-trust cws basic-auth-credentials secrets get <secret-id>\n\nReturns the specified secret's metadata without exposing its password or hash.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
