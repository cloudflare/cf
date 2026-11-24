/**
 * list command
 * @generated from apis/overlays/tags.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cursor: {
			kind: "parsed",
			brief: "Cursor for pagination.",
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
	describe: "List tag keys",
	usage:
		"$0 tags keys list\n\nLists all distinct tag keys used across resources in an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
