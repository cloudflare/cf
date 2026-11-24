/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
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
	describe: "Get BGP Settings",
	usage:
		"$0 magic-transit bgp-settings get\n\nGets the BGP settings for an account, including the default ASN and redistribution configuration.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
