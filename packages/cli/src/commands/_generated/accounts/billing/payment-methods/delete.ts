/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <payment-method-id>",
	describe: "Delete Payment Method",
	usage:
		"$0 accounts billing payment-methods delete <payment-method-id>\n\nDeletes a payment method from an account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
