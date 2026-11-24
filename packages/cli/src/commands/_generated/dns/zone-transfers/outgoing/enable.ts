/**
 * enable command
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
	command: "enable",
	describe: "Enable Outgoing Zone Transfers",
	usage:
		"$0 dns zone-transfers outgoing enable\n\nEnable outgoing zone transfers for primary zone.",
	...parameters,
	loader: () => import("./enable.handler.js"),
});

export default command;
