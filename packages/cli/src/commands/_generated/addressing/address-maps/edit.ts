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
		"default-sni": {
			kind: "parsed",
			brief:
				"If you have legacy TLS clients which do not send the TLS server name indicator, then you can specify one default SNI on the map. If Cloudflare receives a TLS handshake from a client without an SNI, it will respond with the default SNI on those IPs. The default SNI can be any valid zone or subdomain owned by the account.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief:
				"An optional description field which may be used to describe the types of IPs or zones on the map.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Whether the Address Map is enabled or not. Cloudflare's DNS will not respond with IP addresses on an Address Map until the map is enabled.",
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
			placeholder: "address-map-id",
			brief: "Identifier of an Address Map.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <address-map-id>",
	describe: "Update Address Map",
	usage:
		"$0 addressing address-maps edit <address-map-id>\n\nModify properties of an address map owned by the account.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
