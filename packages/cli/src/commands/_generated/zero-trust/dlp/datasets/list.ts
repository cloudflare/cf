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
	describe: "Fetch all datasets",
	usage:
		"$0 zero-trust dlp datasets list\n\nLists all DLP datasets configured for the account, including custom word lists and EDM datasets.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
