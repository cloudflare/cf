/**
 * list-profiles command
 * @generated from apis/overlays/agent-memory.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief: "Opaque continuation cursor returned by a previous list response.",
			optional: true,
			parse: String,
		},
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
	command: "list-profiles <namespace-name>",
	describe: "List profiles",
	usage:
		"$0 agent-memory list-profiles <namespace-name>\n\nLists the profiles of a namespace, ordered by name. A profile appears once it has been used.",
	...parameters,
	loader: () => import("./list-profiles.handler.js"),
});

export default command;
