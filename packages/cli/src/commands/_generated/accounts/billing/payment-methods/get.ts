/**
 * get command
 * @generated from apis/overlays/accounts.ts
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
			placeholder: "payment-method-id",
			brief: "Payment method identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <payment-method-id>",
	describe: "Get Payment Method",
	usage:
		"$0 accounts billing payment-methods get <payment-method-id>\n\nGets a specific payment method for an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
