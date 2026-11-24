/**
 * create command
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
		"dead-letter-queue": {
			kind: "parsed",
			brief: "The dead_letter_queue field",
			optional: true,
			parse: String,
		},
		"script-name": {
			kind: "parsed",
			brief: "Name of a Worker",
			optional: true,
			parse: String,
		},
		"settings-batch-size": {
			kind: "parsed",
			brief: "The maximum number of messages to include in a batch.",
			optional: true,
			parse: Number,
		},
		"settings-max-concurrency": {
			kind: "parsed",
			brief:
				"Maximum number of concurrent consumers that may consume from this Queue. Set to `null` to automatically opt in to the platform's maximum (recommended).",
			optional: true,
			parse: Number,
		},
		"settings-max-retries": {
			kind: "parsed",
			brief: "The maximum number of retries",
			optional: true,
			parse: Number,
		},
		"settings-max-wait-time-ms": {
			kind: "parsed",
			brief:
				"The number of milliseconds to wait for a batch to fill up before attempting to deliver it",
			optional: true,
			parse: Number,
		},
		"settings-retry-delay": {
			kind: "parsed",
			brief:
				"The number of seconds to delay before making the message available for another attempt.",
			optional: true,
			parse: Number,
		},
		"settings-visibility-timeout-ms": {
			kind: "parsed",
			brief:
				"The number of milliseconds that a message is exclusively leased. After the timeout, the message becomes available for another attempt.",
			optional: true,
			parse: Number,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			choices: ["worker", "http_pull"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for creating or updating a consumer",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "queue-id", brief: "A Resource identifier.", parse: String },
	],
	rules(rules) {
		rules.conflicts("script-name", ["settings-visibility-timeout-ms"]);
		rules.conflicts("settings-max-concurrency", [
			"settings-visibility-timeout-ms",
		]);
		rules.implies("settings-max-concurrency", ["script-name"]);
		rules.conflicts("settings-max-wait-time-ms", [
			"settings-visibility-timeout-ms",
		]);
		rules.implies("settings-max-wait-time-ms", ["script-name"]);
		rules.conflicts("settings-visibility-timeout-ms", [
			"script-name",
			"settings-max-concurrency",
			"settings-max-wait-time-ms",
		]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <queue-id>",
	describe: "Create a Queue Consumer",
	usage:
		"$0 queues consumers create <queue-id>\n\nCreates a consumer for a Queue.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
