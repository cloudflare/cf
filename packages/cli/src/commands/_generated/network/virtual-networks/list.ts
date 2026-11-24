/**
 * list command
 * @generated from apis/overlays/network.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results, starting at 1. Defaults to 1.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of virtual networks per page, up to 1000. Defaults to 1000.",
			optional: true,
			parse: Number,
		},
		id: {
			kind: "parsed",
			brief: "UUID of the virtual network.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the virtual network.",
			optional: true,
			parse: String,
		},
		"is-default": {
			kind: "boolean",
			brief:
				"If `true`, only include the default virtual network. If `false`, exclude the default virtual network. If empty, all virtual networks will be included.",
			optional: true,
		},
		"is-default-network": {
			kind: "boolean",
			brief:
				"If `true`, only include the default virtual network. If `false`, exclude the default virtual network. If empty, all virtual networks will be included.",
			optional: true,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only include deleted virtual networks. If `false`, exclude deleted virtual networks. If empty, all virtual networks will be included.",
			optional: true,
		},
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
	command: "list",
	describe: "List virtual networks",
	usage:
		"$0 network virtual-networks list\n\nLists and filters virtual networks in an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
