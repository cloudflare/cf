/**
 * get-cancel-reason command
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
	command: "get-cancel-reason <subscription-identifier>",
	describe: "Get Cancel Reason",
	usage:
		"$0 accounts subscriptions get-cancel-reason <subscription-identifier>\n\nGets the cancellation reason for an account subscription.",
	...parameters,
	loader: () => import("./get-cancel-reason.handler.js"),
});

export default command;
