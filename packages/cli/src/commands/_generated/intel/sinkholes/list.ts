/**
 * list command
 * @generated from apis/overlays/intel.ts
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
	describe: "List sinkholes owned by this account",
	usage:
		"$0 intel sinkholes list\n\nLists sinkholes owned by the account for redirecting malicious traffic.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
