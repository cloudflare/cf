/**
 * list command
 * @generated from apis/overlays/accounts.ts
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
	describe: "List Permission Groups",
	usage:
		"$0 accounts tokens permission-groups list\n\nFind all available permission groups for Account Owned API Tokens. Each permission group indicates whether the caller can select it when creating a token. Token creation performs the authoritative permission check.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
