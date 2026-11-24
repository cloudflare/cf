/**
 * list command
 * @generated from apis/overlays/user.ts
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
				"Filter by the name of the permission group.\nThe value must be URL-encoded.",
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief:
				"Filter by the scope of the permission group.\nThe value must be URL-encoded.",
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
	describe: "List Token Permission Groups",
	usage:
		"$0 user tokens permission-groups list\n\nFind all available permission groups for API Tokens.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
