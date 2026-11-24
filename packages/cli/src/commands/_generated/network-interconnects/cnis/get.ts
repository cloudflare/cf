/**
 * get command
 * @generated from apis/overlays/network-interconnects.ts
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
	operands: [
		{
			placeholder: "cni",
			brief: "CNI ID to retrieve information about",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <cni>",
	describe: "Get information about a CNI object",
	usage:
		"$0 network-interconnects cnis get <cni>\n\nRetrieves configuration details for a specific Cloud Network Interconnect (CNI), including connection status and parameters.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
