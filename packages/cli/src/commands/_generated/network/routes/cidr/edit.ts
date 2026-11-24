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
			brief: "Optional remark describing the route.",
			optional: true,
			parse: String,
		},
		network: {
			kind: "parsed",
			brief:
				"The private IPv4 or IPv6 range connected by the route, in CIDR notation.",
			optional: true,
			parse: String,
		},
		"virtual-network-id": {
			kind: "parsed",
			brief: "UUID of the virtual network.",
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
		{ placeholder: "route-id", brief: "UUID of the route.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <route-id>",
	describe: "Update a tunnel route",
	usage:
		"$0 network routes cidr edit <route-id>\n\nUpdates an existing private network route in an account. The fields that are meant to be updated should be provided in the body of the request.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
