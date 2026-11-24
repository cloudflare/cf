/**
 * delete command
 * @generated from apis/overlays/ai-search.ts
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
		{ placeholder: "namespace", brief: "Namespace to delete.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <namespace>",
	describe: "Delete a namespace",
	usage:
		"$0 ai-search namespace delete <namespace>\n\nDeletes a namespace permanently. The namespace must not contain any instances (instances whose deletion is still in progress do not count), and the default namespace cannot be deleted.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
