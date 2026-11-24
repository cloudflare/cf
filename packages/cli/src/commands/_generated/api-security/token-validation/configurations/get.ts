/**
 * get command
 * @generated from apis/overlays/api-security.ts
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
			placeholder: "config-id",
			brief: "Token Configuration ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <config-id>",
	describe: "Get a token validation configuration",
	usage:
		"$0 api-security token-validation configurations get <config-id>\n\nReturns a JWT validation configuration by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
