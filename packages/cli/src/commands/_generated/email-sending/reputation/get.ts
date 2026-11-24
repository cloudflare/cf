/**
 * get command
 * @generated from apis/overlays/email-sending.ts
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
	describe: "Get account reputation",
	usage:
		"$0 email-sending reputation get\n\nReturns the authoritative Email Sending reputation state and active evaluation policy. Accounts without an evaluation are Healthy with null evaluation timestamps.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
