/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Delete a specific account",
	usage:
		"$0 accounts delete\n\nDelete a specific account (only available for tenant admins at this time). This is a permanent operation that will delete any zones or other resources under the account",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
