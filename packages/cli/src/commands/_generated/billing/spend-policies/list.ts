/**
 * list command
 * @generated from apis/overlays/billing.ts
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
	describe: "List Spend Policies",
	usage:
		"$0 billing spend-policies list\n\nReturns every spend policy on the account that has not been deleted, including disabled ones. Results are sorted by `name`, then `id`. There is no pagination.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
