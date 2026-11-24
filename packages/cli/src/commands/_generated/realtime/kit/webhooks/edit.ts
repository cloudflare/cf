/**
 * edit command
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
			brief: "Omit to keep the current value.",
			optional: true,
		},
		events: {
			kind: "parsed",
			brief: "Events that the webhook will get triggered by",
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
			brief: "URL the webhook will send events to",
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
	command: "edit <webhook-id>",
	describe: "Edit a webhook",
	usage:
		"$0 realtime kit webhooks edit <webhook-id>\n\nEdits the webhook details for the given webhook ID.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
