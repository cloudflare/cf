/**
 * create command
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
			default: "",
			parse: String,
		},
		"is-default-network": {
			kind: "boolean",
			brief:
				"If `true`, this is the default subnet for the account. There can only be one default subnet per account.",
			default: false,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create WARP IP subnet",
	usage:
		"$0 network subnets warp create\n\nCreate a WARP IP assignment subnet. Currently, only IPv4 subnets can be created. **Network constraints:** - The network must be within one of the following private IP ranges: - `10.0.0.0/8` (RFC 1918) - `172.16.0.0/12` (RFC 1918) - `192.168.0.0/16` (RFC 1918) - `100.64.0.0/10` (RFC 6598 - CGNAT) - The subnet must have a prefix length of `/24` or larger (e.g., `/16`, `/20`, `/24` are valid; `/25`, `/28` are not)",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
