/**
 * get command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "queue-id", brief: "A Resource identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <queue-id>",
	describe: "Get Queue Metrics",
	usage:
		"$0 queues metrics get <queue-id>\n\nReturns best-effort metrics for a Queue. Values may be approximate due to the distributed nature of Queues.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
