/**
 * pay-invoice command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"invoice-id": {
			kind: "parsed",
			brief: "The identifier of the invoice to pay.",
			optional: true,
			parse: String,
		},
		"payment-method-id": {
			kind: "parsed",
			brief:
				"The payment method to use. If omitted, the default payment method is used.",
			optional: true,
			parse: String,
		},
		"validate-payment-method": {
			kind: "boolean",
			brief: "Whether to validate the payment method before processing.",
			optional: true,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "pay-invoice",
	describe: "Pay Invoice",
	usage:
		"$0 accounts billing pay-invoice\n\nPays an outstanding invoice for an account. Returns a Stripe client secret when Strong Customer Authentication (SCA) is required to complete the payment.",
	...parameters,
	loader: () => import("./pay-invoice.handler.js"),
});

export default command;
