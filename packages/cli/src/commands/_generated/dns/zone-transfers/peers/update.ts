/**
 * update command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		ip: {
			kind: "parsed",
			brief:
				"IPv4/IPv6 address of primary or secondary nameserver, depending on what zone this peer is linked to. For primary zones this IP defines the IP of the secondary nameserver Cloudflare will NOTIFY upon zone changes. For secondary zones this IP defines the IP of the primary nameserver Cloudflare will send AXFR/IXFR requests to.",
			optional: true,
			parse: String,
		},
		"ixfr-enable": {
			kind: "boolean",
			brief:
				"Enable IXFR transfer protocol, default is AXFR. Only applicable to secondary zones.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The name of the peer.",
			optional: true,
			parse: String,
		},
		port: {
			kind: "parsed",
			brief:
				"DNS port of primary or secondary nameserver, depending on what zone this peer is linked to.",
			optional: true,
			parse: Number,
		},
		"tsig-id": {
			kind: "parsed",
			brief:
				"TSIG authentication will be used for zone transfer if configured.",
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
	operands: [{ placeholder: "peer-id", brief: "Peer ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <peer-id>",
	describe: "Update Peer",
	usage: "$0 dns zone-transfers peers update <peer-id>\n\nModify Peer.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
