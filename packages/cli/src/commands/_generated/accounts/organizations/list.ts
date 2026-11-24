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
	describe: "List account organizations",
	usage:
		'$0 accounts organizations list\n\nRetrieve a list of the organizations that "contain" this account or are managing it. The returned list will be in order from "root" to "leaf", where the "leaf" will be the organization that _immediately_ contains the specified account.',
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
