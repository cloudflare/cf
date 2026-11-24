/**
 * status command
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
	command: "status <queue-id>",
	describe: "Get Queue Purge Status",
	usage:
		"$0 queues purge status <queue-id>\n\nReturns the status of a Queue purge operation.",
	...parameters,
	loader: () => import("./status.handler.js"),
});

export default command;
