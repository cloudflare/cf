/**
 * get-namespace command
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
	},
	operands: [
		{ placeholder: "namespace-name", brief: "Namespace name.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-namespace <namespace-name>",
	describe: "Get a namespace",
	usage:
		"$0 agent-memory get-namespace <namespace-name>\n\nGets a namespace by name.",
	...parameters,
	loader: () => import("./get-namespace.handler.js"),
});

export default command;
