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
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
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
				"Filter instances whose id contains this string (case-insensitive).",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief:
				"Return only instances with this exact Search for Agents hostname (case-insensitive).",
			optional: true,
			parse: String,
		},
		"order-by": {
			kind: "enum",
			brief: "Field to order results by.",
			values: ["created_at"],
			optional: true,
		},
		"order-by-direction": {
			kind: "enum",
			brief: "Order direction.",
			values: ["asc", "desc"],
			optional: true,
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
	describe: "List AI Search instances.",
	usage: "$0 ai-search list\n\nLists all AI Search instances in the account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
