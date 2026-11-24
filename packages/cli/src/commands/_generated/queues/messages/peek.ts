/**
 * peek command
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
	command: "peek <queue-id>",
	describe: "Peek Queue Messages",
	usage:
		"$0 queues messages peek <queue-id>\n\nPeek messages from a Queue without leasing them. Each message includes a ref that can be passed to the purge endpoint, and remains available for subsequent peek or pull operations until it is purged.",
	...parameters,
	loader: () => import("./peek.handler.js"),
});

export default command;
