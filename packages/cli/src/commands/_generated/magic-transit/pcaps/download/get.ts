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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [{ placeholder: "pcap-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <pcap-id>",
	describe: "Download Simple PCAP",
	usage:
		"$0 magic-transit pcaps download get <pcap-id>\n\nDownload PCAP information into a file. Response is a binary PCAP file.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
