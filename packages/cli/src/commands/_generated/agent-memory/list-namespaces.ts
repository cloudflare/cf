/**
 * list-namespaces command
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
		order: {
			kind: "enum",
			brief: "Field to order the results by.",
			values: ["id", "name"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to sort the results in.",
			values: ["asc", "desc"],
			optional: true,
		},
		cursor: {
			kind: "parsed",
			brief: "Pagination cursor returned by a previous list response.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list-namespaces",
	describe: "List namespaces",
	usage:
		"$0 agent-memory list-namespaces\n\nLists all namespaces for the given account. Results are paginated.",
	...parameters,
	loader: () => import("./list-namespaces.handler.js"),
});

export default command;
