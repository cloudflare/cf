/**
 * get command
 * @generated from apis/overlays/zones.ts
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
	describe: "Zone Details",
	usage:
		"$0 zones get\n\nRetrieves detailed information about a specific zone identified by its zone ID. Returns zone configuration, status, nameservers, and associated metadata.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
