/**
 * update command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		address: {
			kind: "parsed",
			brief: "Billing address line 1.",
			optional: true,
			parse: String,
		},
		address2: {
			kind: "parsed",
			brief: "Billing address line 2.",
			optional: true,
			parse: String,
		},
		"bank-account-type": {
			kind: "parsed",
			brief: "Bank account type.",
			optional: true,
			parse: String,
		},
		"bank-code": {
			kind: "parsed",
			brief: "Bank code.",
			optional: true,
			parse: String,
		},
		"bank-country": {
			kind: "parsed",
			brief: "Bank country.",
			optional: true,
			parse: String,
		},
		"bank-name": {
			kind: "parsed",
			brief: "Bank name for bank-based payment methods.",
			optional: true,
			parse: String,
		},
		"bank-routing-number": {
			kind: "parsed",
			brief: "Bank routing number.",
			optional: true,
			parse: String,
		},
		"cashapp-cash-tag": {
			kind: "parsed",
			brief: "Cash App cash tag.",
			optional: true,
			parse: String,
		},
		city: {
			kind: "parsed",
			brief: "Billing city.",
			optional: true,
			parse: String,
		},
		country: {
			kind: "parsed",
			brief: "Billing country.",
			optional: true,
			parse: String,
		},
		default: {
			kind: "boolean",
			brief: "Whether this is the default payment method.",
			optional: true,
		},
		"device-data": {
			kind: "parsed",
			brief: "Device data for fraud prevention.",
			optional: true,
			parse: String,
		},
		"first-name": {
			kind: "parsed",
			brief: "Billing first name.",
			optional: true,
			parse: String,
		},
		"last-name": {
			kind: "parsed",
			brief: "Billing last name.",
			optional: true,
			parse: String,
		},
		"nick-name": {
			kind: "parsed",
			brief: "A nickname for the payment method.",
			optional: true,
			parse: String,
		},
		"payment-account-email": {
			kind: "parsed",
			brief: "Email associated with the payment account.",
			optional: true,
			parse: String,
		},
		"payment-email": {
			kind: "parsed",
			brief: "Payment email address.",
			optional: true,
			parse: String,
		},
		"payment-gateway": {
			kind: "parsed",
			brief: "The payment gateway used.",
			optional: true,
			parse: String,
		},
		"payment-nonce": {
			kind: "parsed",
			brief: "Payment nonce for tokenized payments.",
			optional: true,
			parse: String,
		},
		state: {
			kind: "parsed",
			brief: "Billing state.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The payment method type.",
			optional: true,
			choices: [
				"CREDIT_CARD",
				"PAYPAL",
				"CASHAPP",
				"SEPA_DEBIT",
				"LINK",
				"ACH_DIRECT_DEBIT",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		zipcode: {
			kind: "parsed",
			brief: "Billing zip code.",
			optional: true,
			parse: String,
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
	command: "update <payment-method-id>",
	describe: "Update Payment Method",
	usage:
		"$0 accounts billing payment-methods update <payment-method-id>\n\nUpdates a payment method for an account.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
