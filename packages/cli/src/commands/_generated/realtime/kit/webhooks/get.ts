/**
 * get command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "webhook-id", brief: "ID of the webhook", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <webhook-id>",
	describe: "Fetch details of a webhook",
	usage:
		"$0 realtime kit webhooks get <webhook-id>\n\nReturns webhook details for the given webhook ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
