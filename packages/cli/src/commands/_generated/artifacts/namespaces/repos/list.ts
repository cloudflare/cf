/**
 * list command
 * @generated from apis/overlays/artifacts.ts
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
			brief: "Artifacts namespace name.",
			parse: String,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		cursor: { kind: "parsed", brief: "Cursor", optional: true, parse: String },
		search: { kind: "parsed", brief: "Search", optional: true, parse: String },
		sort: {
			kind: "enum",
			brief: "Sort",
			values: ["created_at", "updated_at", "last_push_at", "name"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction",
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
	describe: "List repositories",
	usage:
		"$0 artifacts namespaces repos list\n\nLists repositories in a namespace.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
