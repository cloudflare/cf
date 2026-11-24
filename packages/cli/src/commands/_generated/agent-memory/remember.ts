/**
 * remember command
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
		content: {
			kind: "parsed",
			brief: "Raw memory content to store.",
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
	command: "remember <profile-name>",
	describe: "Remember a memory",
	usage:
		"$0 agent-memory remember <profile-name>\n\nStores a single memory explicitly.",
	...parameters,
	loader: () => import("./remember.handler.js"),
});

export default command;
