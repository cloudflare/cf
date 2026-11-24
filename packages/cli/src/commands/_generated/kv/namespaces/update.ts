/**
 * update command
 * @generated from apis/overlays/kv.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		title: {
			kind: "parsed",
			brief: "Human-readable string name for a Workers KV namespace.",
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
		{
			placeholder: "namespace-id",
			brief: "ID of the Workers KV namespace.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <namespace-id>",
	describe: "Rename a namespace",
	usage:
		"$0 kv namespaces update <namespace-id>\n\nChanges the title of the specified Workers KV namespace and returns the updated namespace. The namespace ID and stored key-value pairs are unchanged.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
