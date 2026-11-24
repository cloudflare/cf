/**
 * get command
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
	command: "get",
	describe: "Get risk score info for all users in the account",
	usage:
		"$0 zero-trust risk-scoring summary get\n\nGets an aggregate summary of risk scores across the account, including distribution and trends.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
