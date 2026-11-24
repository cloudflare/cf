/**
 * create-payment-intent command
 * @generated from apis/overlays/billing.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create-payment-intent",
	describe: "Create Payment Intent for Billing Profile",
	usage:
		"$0 billing profiles create-payment-intent\n\nCreates a Stripe payment intent for adding or updating a payment method on the account's billing profile. Returns a client secret for frontend payment method collection.",
	...parameters,
	loader: () => import("./create-payment-intent.handler.js"),
});

export default command;
