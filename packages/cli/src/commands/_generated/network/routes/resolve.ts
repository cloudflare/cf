/**
 * resolve command
 * @generated from apis/overlays/network.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"virtual-network-id": {
			kind: "parsed",
			brief: "UUID of the virtual network.",
			optional: true,
			parse: String,
		},
		"default-virtual-network-fallback": {
			kind: "boolean",
			brief:
				"When the virtual_network_id parameter is not provided the request filter will default search routes that are in the default virtual network for the account. If this parameter is set to false, the search will include routes that do not have a virtual network.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "ip", brief: "Ip", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "resolve <ip>",
	describe: "Get tunnel route by IP",
	usage:
		"$0 network routes resolve <ip>\n\nFetches routes that contain the given IP address.",
	...parameters,
	loader: () => import("./resolve.handler.js"),
});

export default command;
