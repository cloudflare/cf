/**
 * extend-leases command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		extend: {
			kind: "parsed",
			brief:
				'The extend field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"lease_id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
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
	command: "extend-leases <queue-id>",
	describe: "Extend Message Leases",
	usage:
		"$0 queues messages extend-leases <queue-id>\n\nExtends message leases without incrementing the messages' `attempts` counters. Each message receives a new lease identifier.",
	...parameters,
	loader: () => import("./extend-leases.handler.js"),
});

export default command;
