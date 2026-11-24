/**
 * list command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number (1-indexed).",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		search: {
			kind: "parsed",
			brief:
				"Filter namespaces whose name or description contains this string (case-insensitive).",
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
	command: "list",
	describe: "List namespaces",
	usage:
		"$0 ai-search namespace list\n\nLists namespaces in the account, including their descriptions and creation times.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
