/**
 * get command
 * @generated from apis/overlays/network.ts
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
			placeholder: "virtual-network-id",
			brief: "UUID of the virtual network.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <virtual-network-id>",
	describe: "Get a virtual network",
	usage:
		"$0 network virtual-networks get <virtual-network-id>\n\nGet a virtual network.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
