/**
 * get command
 * @generated from apis/overlays/kv.ts
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
		{
			placeholder: "namespace-id",
			brief: "ID of the Workers KV namespace.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <namespace-id>",
	describe: "Get a namespace",
	usage:
		"$0 kv namespaces get <namespace-id>\n\nReturns the Workers KV namespace for the specified account and namespace ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
