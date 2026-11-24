/**
 * disable command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "disable",
	describe: "Disable Outgoing Zone Transfers",
	usage:
		"$0 dns zone-transfers outgoing disable\n\nDisable outgoing zone transfers for primary zone and clears IXFR backlog of primary zone.",
	...parameters,
	loader: () => import("./disable.handler.js"),
});

export default command;
