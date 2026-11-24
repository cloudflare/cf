/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"bond-id": {
			kind: "parsed",
			brief: "The bond_id field",
			optional: true,
			parse: Number,
		},
		"ha-link": {
			kind: "boolean",
			brief:
				"mark true to use this LAN for HA probing. only works for site with HA turned on. only one LAN can be set as the ha_link.",
			optional: true,
		},
		"is-breakout": {
			kind: "boolean",
			brief: "mark true to use this LAN for source-based breakout traffic",
			optional: true,
		},
		"is-prioritized": {
			kind: "boolean",
			brief: "mark true to use this LAN for source-based prioritized traffic",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"nat-static-prefix": {
			kind: "parsed",
			brief: "A valid CIDR notation representing an IP range.",
			optional: true,
			parse: String,
		},
		physport: {
			kind: "parsed",
			brief: "The physport field",
			optional: true,
			parse: Number,
		},
		"remote-subnets": {
			kind: "parsed",
			brief:
				'The remote_subnets field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"local_alias_prefix": string, "remote_prefix": string}].',
			optional: true,
			parse: String,
		},
		"routed-subnets": {
			kind: "parsed",
			brief:
				'The routed_subnets field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"next_hop": string, "prefix": string, "nat"?: {...}}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"static-addressing-address": {
			kind: "parsed",
			brief: "A valid CIDR notation representing an IP range.",
			optional: true,
			parse: String,
		},
		"static-addressing-dhcp-relay-server-addresses": {
			kind: "parsed",
			brief: "List of DHCP server IPs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"static-addressing-dhcp-server-dhcp-options": {
			kind: "parsed",
			brief:
				'Optional list of custom DHCP options to include in DHCP responses. Only valid when DHCP server is enabled. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"code": number, "type": "text" | "hex" | "ip" | ...more, "value": string}].',
			optional: true,
			parse: String,
		},
		"static-addressing-dhcp-server-dhcp-pool-end": {
			kind: "parsed",
			brief: "A valid IPv4 address.",
			optional: true,
			parse: String,
		},
		"static-addressing-dhcp-server-dhcp-pool-start": {
			kind: "parsed",
			brief: "A valid IPv4 address.",
			optional: true,
			parse: String,
		},
		"static-addressing-dhcp-server-dns-server": {
			kind: "parsed",
			brief: "A valid IPv4 address.",
			optional: true,
			parse: String,
		},
		"static-addressing-dhcp-server-dns-servers": {
			kind: "parsed",
			brief: "The static_addressing.dhcp_server.dns_servers field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"static-addressing-dhcp-server-reservations": {
			kind: "parsed",
			brief:
				'Mapping of MAC addresses to IP addresses. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"static-addressing-secondary-address": {
			kind: "parsed",
			brief: "A valid CIDR notation representing an IP range.",
			optional: true,
			parse: String,
		},
		"static-addressing-virtual-address": {
			kind: "parsed",
			brief: "A valid CIDR notation representing an IP range.",
			optional: true,
			parse: String,
		},
		"vlan-tag": {
			kind: "parsed",
			brief: "VLAN ID. Use zero for untagged.",
			optional: true,
			parse: Number,
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
	operands: [{ placeholder: "site-id", brief: "Identifier", parse: String }],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"static-addressing-address",
				"static-addressing-dhcp-relay-server-addresses",
				"static-addressing-dhcp-server-dhcp-options",
				"static-addressing-dhcp-server-dhcp-pool-end",
				"static-addressing-dhcp-server-dhcp-pool-start",
				"static-addressing-dhcp-server-dns-server",
				"static-addressing-dhcp-server-dns-servers",
				"static-addressing-dhcp-server-reservations",
				"static-addressing-secondary-address",
				"static-addressing-virtual-address",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["static-addressing-address"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --static-addressing-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <site-id>",
	describe: "Create a new Site LAN",
	usage:
		"$0 magic-transit sites lans create <site-id>\n\nCreates a new Site LAN. If the site is in high availability mode, static_addressing is required along with secondary and virtual address.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
