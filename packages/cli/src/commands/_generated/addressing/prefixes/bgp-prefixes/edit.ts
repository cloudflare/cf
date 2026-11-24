/**
 * edit command
 * @generated from apis/overlays/addressing.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"prefix-id": {
			kind: "parsed",
			brief: "Identifier of an IP Prefix.",
			parse: String,
		},
		"asn-prepend-count": {
			kind: "parsed",
			brief:
				"Number of times to prepend the Cloudflare ASN to the BGP AS-Path attribute",
			optional: true,
			parse: Number,
		},
		"auto-advertise-withdraw": {
			kind: "boolean",
			brief:
				"Determines if Cloudflare advertises a BYOIP BGP prefix even when there is no matching BGP prefix in the Magic routing table. When true, Cloudflare will automatically withdraw the BGP prefix when there are no matching BGP routes, and will resume advertising when there is at least one matching BGP route.",
			optional: true,
		},
		"on-demand-advertised": {
			kind: "boolean",
			brief: "The on_demand.advertised field",
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
	operands: [
		{
			placeholder: "bgp-prefix-id",
			brief: "Identifier of BGP Prefix.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <bgp-prefix-id>",
	describe: "Update BGP Prefix",
	usage:
		"$0 addressing prefixes bgp-prefixes edit <bgp-prefix-id>\n\nUpdate the properties of a BGP Prefix, such as the on demand advertisement status (advertised or withdrawn).",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
