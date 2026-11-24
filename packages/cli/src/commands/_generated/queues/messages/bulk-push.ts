/**
 * bulk-push command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"queue-id": {
			kind: "parsed",
			brief: "A Resource identifier.",
			parse: String,
		},
		"delay-seconds": {
			kind: "parsed",
			brief:
				"The number of seconds to wait for attempting to deliver this batch to consumers",
			optional: true,
			parse: Number,
		},
		messages: {
			kind: "parsed",
			brief:
				'The messages field. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"delay_seconds"?: number} & ({"body"?: string, "content_type"?: "text"} | {"body"?: {...}, "content_type"?: "json"}))]. ? marks optional keys.',
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
	command: "bulk-push",
	describe: "Push Message Batch",
	usage:
		"$0 queues messages bulk-push\n\nPushes a batch of messages to a Queue.",
	...parameters,
	loader: () => import("./bulk-push.handler.js"),
});

export default command;
