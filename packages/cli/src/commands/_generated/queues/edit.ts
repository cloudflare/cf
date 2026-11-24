/**
 * edit command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		jurisdiction: {
			kind: "parsed",
			brief: "The jurisdiction field",
			optional: true,
			choices: ["eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		"queue-name": {
			kind: "parsed",
			brief: "The queue_name field",
			optional: true,
			parse: String,
		},
		"settings-delivery-delay": {
			kind: "parsed",
			brief:
				"Number of seconds to delay delivery of all messages to consumers.",
			optional: true,
			parse: Number,
		},
		"settings-delivery-paused": {
			kind: "boolean",
			brief: "Indicates if message delivery to consumers is currently paused.",
			optional: true,
		},
		"settings-message-retention-period": {
			kind: "parsed",
			brief:
				"Number of seconds after which an unconsumed message will be delayed.",
			optional: true,
			parse: Number,
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
		{ placeholder: "queue-id", brief: "A Resource identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <queue-id>",
	describe: "Update Queue",
	usage:
		"$0 queues edit <queue-id>\n\nUpdates part of a Queue's configuration.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
