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
		kind: {
			kind: "enum",
			brief: "Only return validators of this kind. Omit to return every kind.",
			values: ["proximity_words", "worker"],
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
	describe: "List validators",
	usage:
		"$0 zero-trust dlp validators list\n\nLists the validators configured for the account, of every kind.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
