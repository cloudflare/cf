/**
 * get command
 * @generated from apis/overlays/queues.ts
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
			placeholder: "subscription-id",
			brief: "A Resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <subscription-id>",
	describe: "Get Event Subscription",
	usage:
		"$0 queues subscriptions get <subscription-id>\n\nReturns an existing Queue event subscription.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
