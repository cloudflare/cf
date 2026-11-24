/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <virtual-network-id>",
	describe: "Delete a virtual network",
	usage:
		"$0 network virtual-networks delete <virtual-network-id>\n\nDeletes an existing virtual network.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
