/**
 * get command
 * @generated from apis/overlays/alerting.ts
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
			placeholder: "webhook-id",
			brief: "The unique identifier of a webhook",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <webhook-id>",
	describe: "Get a webhook",
	usage:
		"$0 alerting destinations webhooks get <webhook-id>\n\nGet details for a single webhooks destination.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
