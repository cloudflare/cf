/**
 * status command
 * @generated from apis/overlays/dns.ts
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
	command: "status",
	describe: "Get Outgoing Zone Transfer Status",
	usage:
		"$0 dns zone-transfers outgoing status\n\nGet primary zone transfer status.",
	...parameters,
	loader: () => import("./status.handler.js"),
});

export default command;
