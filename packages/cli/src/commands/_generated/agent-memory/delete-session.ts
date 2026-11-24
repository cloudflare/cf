/**
 * delete-session command
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
		{ placeholder: "session-id", brief: "Session identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete-session <session-id>",
	describe: "Delete a session",
	usage:
		"$0 agent-memory delete-session <session-id>\n\nMarks all memories and messages in a profile that are tagged with the given session ID for deletion.",
	...parameters,
	loader: () => import("./delete-session.handler.js"),
});

export default command;
