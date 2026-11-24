/**
 * get command
 * @generated from apis/overlays/alerting.ts
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
	describe: "Get delivery mechanism eligibility",
	usage:
		"$0 alerting destinations eligible get\n\nGet a list of all delivery mechanism types for which an account is eligible.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
