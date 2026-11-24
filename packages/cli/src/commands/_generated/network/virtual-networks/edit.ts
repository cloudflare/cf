/**
 * edit command
 * @generated from apis/overlays/network.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		comment: {
			kind: "parsed",
			brief: "Optional remark describing the virtual network.",
			optional: true,
			parse: String,
		},
		"is-default-network": {
			kind: "boolean",
			brief: "If `true`, this virtual network is the default for the account.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the virtual network.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
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
	command: "edit <virtual-network-id>",
	describe: "Update a virtual network",
	usage:
		"$0 network virtual-networks edit <virtual-network-id>\n\nUpdates an existing virtual network.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
