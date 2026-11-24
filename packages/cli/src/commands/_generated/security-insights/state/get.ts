/**
 * get command
 * @generated from apis/overlays/security-insights.ts
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
	describe: "Retrieves Account State",
	usage:
		"$0 security-insights state get\n\nReturns account-level Security Center state: whether scans are enabled for the account and whether the account was recently reactivated from a dormant state.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
