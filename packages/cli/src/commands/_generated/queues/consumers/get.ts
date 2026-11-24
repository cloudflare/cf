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
		"queue-id": {
			kind: "parsed",
			brief: "A Resource identifier.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "consumer-id",
			brief: "A Resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <consumer-id>",
	describe: "Get Queue Consumer",
	usage:
		"$0 queues consumers get <consumer-id>\n\nReturns a Queue consumer by identifier.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
