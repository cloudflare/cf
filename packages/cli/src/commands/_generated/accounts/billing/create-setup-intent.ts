/**
 * create-setup-intent command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create-setup-intent",
	describe: "Create Setup Intent",
	usage:
		"$0 accounts billing create-setup-intent\n\nCreates a Stripe setup intent for adding a payment method to an account. Returns a client secret for frontend payment method collection.",
	...parameters,
	loader: () => import("./create-setup-intent.handler.js"),
});

export default command;
