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
		comment: {
			kind: "parsed",
			brief: "Optional remark describing the route.",
			optional: true,
			parse: String,
		},
		"is-deleted": {
			kind: "boolean",
			brief:
				"If `true`, only include deleted routes. If `false`, exclude deleted routes. If empty, all routes will be included.",
			optional: true,
		},
		"network-subset": {
			kind: "parsed",
			brief:
				"If set, only list routes that are contained within this IP range.",
			optional: true,
			parse: String,
		},
		"network-superset": {
			kind: "parsed",
			brief: "If set, only list routes that contain this IP range.",
			optional: true,
			parse: String,
		},
		"existed-at": {
			kind: "parsed",
			brief:
				"If provided, include only resources that were created (and not deleted) before this time. URL encoded.",
			optional: true,
			parse: String,
		},
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
			optional: true,
			parse: String,
		},
		"route-id": {
			kind: "parsed",
			brief: "UUID of the route.",
			optional: true,
			parse: String,
		},
		"tun-types": {
			kind: "parsed",
			brief: "The types of tunnels to filter by, separated by commas.",
			variadic: true,
			optional: true,
			choices: [
				"cfd_tunnel",
				"warp_connector",
				"warp",
				"magic",
				"ip_sec",
				"gre",
				"cni",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"virtual-network-id": {
			kind: "parsed",
			brief: "UUID of the virtual network.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to display.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
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
	describe: "List tunnel routes",
	usage:
		"$0 network routes cidr list\n\nLists and filters private network routes in an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
