/**
 * ingest command
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
		messages: {
			kind: "parsed",
			brief:
				'Conversation messages to extract memories from. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content": string, "role": "system" | "user" | "assistant", "timestamp"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"session-id": {
			kind: "parsed",
			brief: "Session identifier.",
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
		{ placeholder: "profile-name", brief: "Profile name.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "ingest <profile-name>",
	describe: "Ingest messages",
	usage:
		"$0 agent-memory ingest <profile-name>\n\nProcesses a conversation and extracts structured memories from it. Agent Memory identifies facts, events, instructions, and tasks automatically.",
	...parameters,
	loader: () => import("./ingest.handler.js"),
});

export default command;
