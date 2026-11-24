/**
 * update-email command
 * @generated from apis/overlays/billing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"billing-email": {
			kind: "parsed",
			brief: "The billing_email field",
			optional: true,
			parse: String,
		},
		"preferred-locale": {
			kind: "parsed",
			brief: "The preferred_locale field",
			optional: true,
			parse: String,
		},
		"secondary-billing-email": {
			kind: "parsed",
			brief: "The secondary_billing_email field",
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
	command: "update-email",
	describe: "Update Billing Email",
	usage:
		"$0 billing profiles update-email\n\nUpdates the billing email addresses and preferred locale for an account.",
	...parameters,
	loader: () => import("./update-email.handler.js"),
});

export default command;
