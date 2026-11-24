/**
 * stop command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "pcap-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "stop <pcap-id>",
	describe: "Stop full PCAP",
	usage: "$0 magic-transit pcaps stop <pcap-id>\n\nStop full PCAP.",
	...parameters,
	loader: () => import("./stop.handler.js"),
});

export default command;
