/**
 * ack command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		acks: {
			kind: "parsed",
			brief:
				'The acks field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"lease_id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		retries: {
			kind: "parsed",
			brief:
				'The retries field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"delay_seconds"?: number, "lease_id"?: string}]. ? marks optional keys.',
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
		{ placeholder: "queue-id", brief: "A Resource identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "ack <queue-id>",
	describe: "Acknowledge + Retry Queue Messages",
	usage:
		"$0 queues messages ack <queue-id>\n\nAcknowledges successfully processed Queue messages and retries messages that were not processed successfully.",
	...parameters,
	loader: () => import("./ack.handler.js"),
});

export default command;
