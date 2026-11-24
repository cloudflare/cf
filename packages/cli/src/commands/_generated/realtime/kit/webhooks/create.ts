/**
 * create command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: {
			kind: "boolean",
			brief: "Set whether or not the webhook should be active when created",
			default: true,
		},
		events: {
			kind: "parsed",
			brief: "Events that this webhook will get triggered by",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the webhook",
			optional: true,
			parse: String,
		},
		url: {
			kind: "parsed",
			brief: "URL this webhook will send events to",
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
		{ placeholder: "app-id", brief: "The app identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <app-id>",
	describe: "Add a webhook",
	usage:
		"$0 realtime kit webhooks create <app-id>\n\nAdds a new webhook to an App.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
