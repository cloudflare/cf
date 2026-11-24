/**
 * get-memory command
 * @generated from apis/overlays/agent-memory.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"namespace-name": {
			kind: "parsed",
			brief: "Namespace name.",
			parse: String,
		},
		"profile-name": { kind: "parsed", brief: "Profile name.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "memory-id", brief: "Memory Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get-memory <memory-id>",
	describe: "Get a memory",
	usage: "$0 agent-memory get-memory <memory-id>\n\nRetrieves a memory by ID.",
	...parameters,
	loader: () => import("./get-memory.handler.js"),
});

export default command;
