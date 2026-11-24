/**
 * get command
 * @generated from apis/overlays/ssl.ts
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
	describe: "Retrieve the DCV Delegation unique identifier.",
	usage:
		"$0 ssl dcv-delegation get\n\nRetrieve the account and zone specific unique identifier used as part of the CNAME target for DCV Delegation.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
