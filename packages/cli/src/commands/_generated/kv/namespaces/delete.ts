/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <namespace-id>",
	describe: "Delete a namespace",
	usage:
		"$0 kv namespaces delete <namespace-id>\n\nDeletes the specified Workers KV namespace and its stored key-value pairs from the account.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
