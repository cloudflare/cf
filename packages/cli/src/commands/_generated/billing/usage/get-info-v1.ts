/**
 * get-info-v1 command
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
	command: "get-info-v1",
	describe: "Get Account Billable Usage Info (Version 1, Alpha)",
	usage:
		"$0 billing usage get-info-v1\n\nReturns high-level usage information for the account, including coverage, and subscription metadata.",
	...parameters,
	loader: () => import("./get-info-v1.handler.js"),
});

export default command;
