/**
 * get command
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
	command: "get",
	describe: "List tag key summary",
	usage:
		"$0 tags summary get\n\nLists all distinct tag keys and their distinct values across resources in an account.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
