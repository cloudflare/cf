/**
 * replace command
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
		enabled: {
			kind: "boolean",
			brief: "Set whether or not the webhook should be active when created",
			optional: true,
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
		{ placeholder: "webhook-id", brief: "ID of the webhook", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "replace <webhook-id>",
	describe: "Replace a webhook",
	usage:
		"$0 realtime kit webhooks replace <webhook-id>\n\nReplace all details for the given webhook ID.",
	...parameters,
	loader: () => import("./replace.handler.js"),
});

export default command;
