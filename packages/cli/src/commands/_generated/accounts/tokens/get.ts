/**
 * get command
 * @generated from apis/overlays/accounts.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "token-id", brief: "Token identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <token-id>",
	describe: "Token Details",
	usage:
		"$0 accounts tokens get <token-id>\n\nGet information about a specific Account Owned API token.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
