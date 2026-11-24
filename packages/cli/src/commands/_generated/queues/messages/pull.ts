/**
 * pull command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"batch-size": {
			kind: "parsed",
			brief: "The maximum number of messages to include in a batch.",
			optional: true,
			parse: Number,
		},
		"visibility-timeout-ms": {
			kind: "parsed",
			brief:
				"The number of milliseconds that a message is exclusively leased. After the timeout, the message becomes available for another attempt.",
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
	command: "pull <queue-id>",
	describe: "Pull Queue Messages",
	usage:
		"$0 queues messages pull <queue-id>\n\nPulls a batch of messages from a Queue for an HTTP pull consumer.",
	...parameters,
	loader: () => import("./pull.handler.js"),
});

export default command;
