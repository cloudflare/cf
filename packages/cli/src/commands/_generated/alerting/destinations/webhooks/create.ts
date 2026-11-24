/**
 * create command
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
		secret: {
			kind: "parsed",
			brief:
				"Optional secret that will be passed in the `cf-webhook-auth` header when dispatching generic webhook notifications or formatted for supported destinations. Secrets are not returned in any API response body.",
			optional: true,
			parse: String,
		},
		url: {
			kind: "parsed",
			brief: "The POST endpoint to call when dispatching a notification.",
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
	command: "create",
	describe: "Create a webhook",
	usage:
		"$0 alerting destinations webhooks create\n\nCreates a new webhook destination.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
