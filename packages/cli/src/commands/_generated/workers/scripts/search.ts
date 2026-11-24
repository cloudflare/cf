/**
 * search command
 * @generated from apis/overlays/workers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Worker name to search for. Both exact and partial matches are returned.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief:
				"Worker ID (also called tag) to search for. Only exact matches are returned.",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief:
				"Property to sort results by. Results are sorted in ascending order.",
			values: ["created_on", "modified_on", "name"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Current page.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Items per page.",
			optional: true,
			parse: Number,
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
	command: "search",
	describe: "Search Worker Scripts",
	usage:
		"$0 workers scripts search\n\nSearch for Worker scripts in an account.",
	...parameters,
	loader: () => import("./search.handler.js"),
});

export default command;
