/**
 * update command
 * @generated from apis/overlays/billing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		address: {
			kind: "parsed",
			brief: "Street address line 1.",
			optional: true,
			parse: String,
		},
		address2: {
			kind: "parsed",
			brief: "Street address line 2 (apt, suite, etc.).",
			optional: true,
			parse: String,
		},
		"billing-email": {
			kind: "parsed",
			brief: "Primary billing email address.",
			optional: true,
			parse: String,
		},
		"buying-rate-plan": {
			kind: "parsed",
			brief: "Rate plan being purchased right after profile setup.",
			optional: true,
			parse: String,
		},
		"captcha-challenge-jwt": {
			kind: "parsed",
			brief: "Captcha challenge JWT issued during onboarding.",
			optional: true,
			parse: String,
		},
		"cf-turnstile-response": {
			kind: "parsed",
			brief: "Cloudflare Turnstile response.",
			optional: true,
			parse: String,
		},
		city: {
			kind: "parsed",
			brief: "City on the billing profile.",
			optional: true,
			parse: String,
		},
		company: {
			kind: "parsed",
			brief: "Company name on the billing profile.",
			optional: true,
			parse: String,
		},
		country: {
			kind: "parsed",
			brief: "ISO 3166-1 alpha-2 country code.",
			optional: true,
			parse: String,
		},
		"first-name": {
			kind: "parsed",
			brief: "First name on the billing profile.",
			optional: true,
			parse: String,
		},
		"h-captcha-response": {
			kind: "parsed",
			brief: "hCaptcha response.",
			optional: true,
			parse: String,
		},
		"last-name": {
			kind: "parsed",
			brief: "Last name on the billing profile.",
			optional: true,
			parse: String,
		},
		"preferred-locale": {
			kind: "parsed",
			brief: "Preferred locale for invoice rendering (BCP 47).",
			optional: true,
			parse: String,
		},
		"secondary-billing-email": {
			kind: "parsed",
			brief: "Secondary billing email address for CC on invoices.",
			optional: true,
			parse: String,
		},
		state: {
			kind: "parsed",
			brief: "State or region on the billing profile.",
			optional: true,
			parse: String,
		},
		"tax-id-type": {
			kind: "parsed",
			brief: "Type of tax ID provided.",
			optional: true,
			parse: String,
		},
		telephone: {
			kind: "parsed",
			brief: "Contact phone number.",
			optional: true,
			parse: String,
		},
		vat: {
			kind: "parsed",
			brief: "VAT identifier.",
			optional: true,
			parse: String,
		},
		zipcode: {
			kind: "parsed",
			brief: "ZIP or postal code.",
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
			brief: "Request body for creating or updating a billing profile.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update",
	describe: "Update Billing Profile",
	usage:
		"$0 billing profiles update\n\nUpdates the billing profile for an account.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
