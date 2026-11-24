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
	operands: [{ placeholder: "pcap-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <pcap-id>",
	describe: "Get PCAP request",
	usage:
		"$0 magic-transit pcaps get <pcap-id>\n\nGet information for a PCAP request by id.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
