/**
 * get-bad-debt command
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
	command: "get-bad-debt",
	describe: "Get Account Bad Debt",
	usage:
		"$0 accounts billing get-bad-debt\n\nGets bad debt information for an account, including outstanding invoices and total debt amount.",
	...parameters,
	loader: () => import("./get-bad-debt.handler.js"),
});

export default command;
