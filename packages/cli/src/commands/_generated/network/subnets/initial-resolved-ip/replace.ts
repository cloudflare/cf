/**
 * replace command
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
			brief: "An optional description of the subnet.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for the subnet.",
			optional: true,
			parse: String,
		},
		network: {
			kind: "parsed",
			brief:
				"The private IPv4 or IPv6 range defining the subnet, in CIDR notation.",
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
			placeholder: "address-family",
			brief: "IP address family, either \`v4\` (IPv4) or \`v6\` (IPv6)",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "replace <address-family>",
	describe: "Update Initial Resolved IP Subnet",
	usage:
		"$0 network subnets initial-resolved-ip replace <address-family>\n\nUpdates the CIDR for the account's default Initial Resolved IP Subnet of the given address family. The new CIDR must not conflict with existing private routes in the account.",
	...parameters,
	loader: () => import("./replace.handler.js"),
});

export default command;
