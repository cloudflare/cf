/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <subscription-id>",
	describe: "Delete Event Subscription",
	usage:
		"$0 queues subscriptions delete <subscription-id>\n\nDeletes an existing Queue event subscription.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
