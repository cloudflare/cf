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
	describe: "Get sending limits",
	usage:
		"$0 email-sending limits get\n\nReturns the current daily sending quota for the account and, when a quota is resolved, the account's current usage against it. Quota is null when not yet available; usage is null when there is no resolved quota or usage is temporarily unavailable.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
