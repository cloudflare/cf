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
	describe: "List Image Resizing configurations for account",
	usage:
		"$0 accounts transformations list\n\nReturns a list of Image Resizing configurations across all zones for the account. This endpoint is useful for retrieving the transformations (image_resizing) state for all zones belonging to an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
