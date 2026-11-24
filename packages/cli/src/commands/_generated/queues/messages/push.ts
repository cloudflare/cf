/**
 * push command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"delay-seconds": {
			kind: "parsed",
			brief:
				"The number of seconds to wait for attempting to deliver this message to consumers",
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
	command: "push <queue-id>",
	describe: "Push Message",
	usage: "$0 queues messages push <queue-id>\n\nPushes a message to a Queue.",
	...parameters,
	loader: () => import("./push.handler.js"),
});

export default command;
