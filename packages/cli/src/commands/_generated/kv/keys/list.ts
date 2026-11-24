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
		"namespace-id": {
			kind: "parsed",
			brief: "ID of the Workers KV namespace.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief:
				"Maximum number of keys to return in one response. Pass `result_info.cursor` from the response as `cursor` to request the next page.",
			optional: true,
			parse: Number,
		},
		prefix: {
			kind: "parsed",
			brief:
				"Filters returned keys by a name prefix. Exact matches and any key names that begin with the prefix will be returned.",
			optional: true,
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque pagination token from `result_info.cursor` in the previous response. Pass it unchanged to request the next page of keys.",
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
	describe: "List keys in a namespace",
	usage:
		"$0 kv keys list\n\nLists key names in the specified Workers KV namespace, with expiration times and metadata when present. Use `prefix` to filter names and `cursor` to request the next page. Values are not included.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
