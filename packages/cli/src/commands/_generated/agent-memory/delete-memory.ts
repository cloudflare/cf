/**
 * delete-memory command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{ placeholder: "memory-id", brief: "Memory Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete-memory <memory-id>",
	describe: "Delete a memory",
	usage:
		"$0 agent-memory delete-memory <memory-id>\n\nDeletes a memory by ID. Removes the memory and any source messages linked to it. Returns the deleted memory.",
	...parameters,
	loader: () => import("./delete-memory.handler.js"),
});

export default command;
