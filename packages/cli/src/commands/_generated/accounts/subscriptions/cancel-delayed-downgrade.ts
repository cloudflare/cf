/**
 * cancel-delayed-downgrade command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"subscription-ids": {
			kind: "parsed",
			brief: "List of subscription identifiers to cancel downgrades for.",
			variadic: true,
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
	command: "cancel-delayed-downgrade",
	describe: "Cancel Delayed Downgrade",
	usage:
		"$0 accounts subscriptions cancel-delayed-downgrade\n\nCancels pending delayed downgrades for the specified subscriptions.",
	...parameters,
	loader: () => import("./cancel-delayed-downgrade.handler.js"),
});

export default command;
