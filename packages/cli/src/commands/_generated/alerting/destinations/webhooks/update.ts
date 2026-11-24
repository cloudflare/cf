/**
 * update command
 * @generated from apis/overlays/alerting.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief:
				"The name of the webhook destination. This will be included in the request body when you receive a webhook notification.",
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
	command: "update <webhook-id>",
	describe: "Update a webhook",
	usage:
		"$0 alerting destinations webhooks update <webhook-id>\n\nUpdate a webhook destination. Only `name` can be updated. `url` and `secret` are immutable; to change them, delete the webhook and create a new one.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
