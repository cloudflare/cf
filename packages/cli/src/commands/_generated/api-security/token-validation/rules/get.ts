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
			placeholder: "rule-id",
			brief: "Token Validation Rule ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <rule-id>",
	describe: "Get a token validation rule",
	usage:
		"$0 api-security token-validation rules get <rule-id>\n\nReturns a token validation rule by ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
