/**
 * count-zones-enabled-for-account command
 * @generated from apis/overlays/argo.ts
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
	command: "count-zones-enabled-for-account",
	describe: "Get count of zones with Argo Smart Routing enabled for account",
	usage:
		"$0 argo smart-routing count-zones-enabled-for-account\n\nReturns the number of zones that have Argo Smart Routing enabled for the specified account.",
	...parameters,
	loader: () => import("./count-zones-enabled-for-account.handler.js"),
});

export default command;
