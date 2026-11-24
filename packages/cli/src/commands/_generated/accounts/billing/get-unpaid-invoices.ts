/**
 * get-unpaid-invoices command
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
	command: "get-unpaid-invoices",
	describe: "Get Unpaid Invoices",
	usage:
		"$0 accounts billing get-unpaid-invoices\n\nGets unpaid invoice information for an account.",
	...parameters,
	loader: () => import("./get-unpaid-invoices.handler.js"),
});

export default command;
