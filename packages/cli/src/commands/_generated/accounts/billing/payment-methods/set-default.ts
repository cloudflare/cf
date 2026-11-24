/**
 * set-default command
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
	command: "set-default <payment-method-id>",
	describe: "Set Default Payment Method",
	usage:
		"$0 accounts billing payment-methods set-default <payment-method-id>\n\nSets a payment method as the default for an account.",
	...parameters,
	loader: () => import("./set-default.handler.js"),
});

export default command;
