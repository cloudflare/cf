/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		all: {
			kind: "boolean",
			brief:
				"Return all profiles, including those that current account does not have access to.",
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
	describe: "List all profiles",
	usage:
		"$0 zero-trust dlp profiles list\n\nLists all DLP profiles in an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
