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
	describe: "Get Zero Trust organization trust settings",
	usage:
		"$0 zero-trust organization trust-settings get\n\nReturns the trust settings for your Zero Trust organization.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
