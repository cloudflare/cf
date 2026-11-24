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
	describe: "Returns account commands usage, quota, and reset time",
	usage:
		"$0 zero-trust dex commands quota get\n\nRetrieves the current quota usage and limits for device commands within a specific account, including the time when the quota will reset",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
