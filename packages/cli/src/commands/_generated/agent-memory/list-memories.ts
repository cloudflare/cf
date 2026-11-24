/**
 * list-memories command
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
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief: "Continuation cursor for paginated results.",
			optional: true,
			parse: String,
		},
		"session-id": {
			kind: "parsed",
			brief: "Session identifier for filtering.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "enum",
			brief: "Memory type for filtering.",
			values: ["fact", "event", "instruction", "task"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "profile-name", brief: "Profile name.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list-memories <profile-name>",
	describe: "List memories",
	usage:
		"$0 agent-memory list-memories <profile-name>\n\nList memories stored in a profile.",
	...parameters,
	loader: () => import("./list-memories.handler.js"),
});

export default command;
