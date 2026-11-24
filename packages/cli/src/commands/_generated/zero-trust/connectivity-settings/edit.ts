/**
 * edit command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"icmp-proxy-enabled": {
			kind: "boolean",
			brief: "A flag to enable the ICMP proxy for the account network.",
			optional: true,
		},
		"offramp-warp-enabled": {
			kind: "boolean",
			brief: "A flag to enable WARP to WARP traffic.",
			optional: true,
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
	command: "edit",
	describe: "Updates the Zero Trust Connectivity Settings",
	usage:
		"$0 zero-trust connectivity-settings edit\n\nUpdates the Zero Trust Connectivity Settings for the given account.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
