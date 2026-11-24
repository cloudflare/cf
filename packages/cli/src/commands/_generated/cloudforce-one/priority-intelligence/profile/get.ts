/**
 * get command
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
	command: "get",
	describe: "Get the organization profile",
	usage:
		"$0 cloudforce-one priority-intelligence profile get\n\nReturns the account's organization profile, which all of its Priority Intelligence Requirements share to judge how relevant intelligence is to the organization. `result` is null when the account has no profile.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
