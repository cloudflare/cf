/**
 * update command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"cloudflare-asn": {
			kind: "parsed",
			brief:
				"Route advertisements from Cloudflare to ramps in this account will use this ASN.",
			optional: true,
			parse: Number,
		},
		"redistribute-static:wan": {
			kind: "boolean",
			brief: "Redistribute static WAN routes into BGP",
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
	command: "update",
	describe: "Update BGP Settings",
	usage:
		"$0 magic-transit bgp-settings update\n\nModifies the BGP settings for an account, including the default ASN and redistribution configuration.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
