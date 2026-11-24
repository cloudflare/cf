/**
 * list command
 * @generated from apis/overlays/kv.ts
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
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Namespace field to sort by (`id` or `title`).",
			values: ["id", "title"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief:
				"Sort namespaces in ascending (`asc`) or descending (`desc`) order.",
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
	describe: "List namespaces",
	usage:
		"$0 kv namespaces list\n\nLists Workers KV namespaces owned by the specified account. Use `page` and `per_page` to select a page of results, and `order` and `direction` to control sorting.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
