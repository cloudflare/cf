/**
 * delete-namespace command
 * @generated from apis/overlays/agent-memory.ts
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
		{ placeholder: "namespace-name", brief: "Namespace name.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete-namespace <namespace-name>",
	describe: "Delete a namespace",
	usage:
		"$0 agent-memory delete-namespace <namespace-name>\n\nDeletes a namespace.",
	...parameters,
	loader: () => import("./delete-namespace.handler.js"),
});

export default command;
