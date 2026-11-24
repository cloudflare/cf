/**
 * get-by-identifier command
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
			placeholder: "subscription-identifier",
			brief: "Subscription identifier tag.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-by-identifier <subscription-identifier>",
	describe: "Get Subscription",
	usage:
		"$0 accounts subscriptions get-by-identifier <subscription-identifier>\n\nGets an account subscription by identifier.",
	...parameters,
	loader: () => import("./get-by-identifier.handler.js"),
});

export default command;
