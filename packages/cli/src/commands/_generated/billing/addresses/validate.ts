/**
 * validate command
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
			brief: "Address line 1.",
			optional: true,
			parse: String,
		},
		address2: {
			kind: "parsed",
			brief: "Address line 2.",
			optional: true,
			parse: String,
		},
		city: { kind: "parsed", brief: "City.", optional: true, parse: String },
		country: {
			kind: "parsed",
			brief: "Country code.",
			optional: true,
			parse: String,
		},
		state: {
			kind: "parsed",
			brief: "State or province.",
			optional: true,
			parse: String,
		},
		zipcode: {
			kind: "parsed",
			brief: "Postal or zip code.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "validate",
	describe: "Validate Billing Address",
	usage:
		"$0 billing addresses validate\n\nValidates a billing address and returns validated address suggestions. Authentication is not enforced to support pre-signup address validation flows, so credentials are accepted but not required.",
	...parameters,
	loader: () => import("./validate.handler.js"),
});

export default command;
