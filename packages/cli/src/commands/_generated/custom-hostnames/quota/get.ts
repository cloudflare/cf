/**
 * get command
 * @generated from apis/overlays/custom-hostnames.ts
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
	describe: "Get Custom Hostname Quota",
	usage:
		"$0 custom-hostnames quota get\n\nReturns custom hostname quota usage for a zone. The allocated quota is a soft limit; creating custom hostnames after usage exceeds this limit can still succeed until the hard cap is reached. Use the exceeded and hard_cap fields to track when usage is above the soft limit and when new custom hostname creation will be rejected.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
