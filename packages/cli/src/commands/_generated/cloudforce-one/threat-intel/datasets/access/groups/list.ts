/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
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
	describe: "List account groups",
	usage:
		"$0 cloudforce-one threat-intel datasets access groups list\n\nLists the account groups. A group is a set of accounts that can be given access to a dataset with `threat-intel datasets access permissions create`.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
