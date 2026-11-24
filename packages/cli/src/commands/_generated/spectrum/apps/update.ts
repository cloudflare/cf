/**
 * update command
 * @generated from apis/overlays/spectrum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"argo-smart-routing": {
			kind: "boolean",
			brief:
				'Enables Argo Smart Routing for this application.\nNotes: Only available for TCP or UDP applications with traffic_type set to "direct".',
			optional: true,
		},
		"dns-name": {
			kind: "parsed",
			brief: "The name of the DNS record associated with the application.",
			optional: true,
			parse: String,
		},
		"dns-type": {
			kind: "parsed",
			brief: "The type of DNS record associated with the application.",
			optional: true,
			choices: ["CNAME", "ADDRESS"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "dns-type", "text"),
		},
		"edge-alpn-protocols": {
			kind: "parsed",
			brief:
				'ALPN protocol IDs the edge offers on client TLS connections, in preference order, for example `["h2"]` for gRPC or `["postgresql"]` for PostgreSQL direct TLS. When set, clients that offer none of these protocols, or no ALPN at all, are disconnected. Empty means no ALPN.\nNotes: Requires tls "flexible", "full" or "strict", and is not available with traffic_type "ftp". IDs are case-sensitive and unique, each 1 to 255 bytes; the list encodes to at most 65535 bytes, counting each ID plus one length byte.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"edge-ips-connectivity": {
			kind: "parsed",
			brief:
				"The IP versions supported for inbound connections on Spectrum anycast IPs.",
			optional: true,
			choices: ["all", "ipv4", "ipv6"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "edge-ips-connectivity", "text"),
		},
		"edge-ips-type": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- `dynamic`: The type of edge IP configuration specified. Dynamically allocated edge IPs use Spectrum anycast IPs in accordance with the connectivity you specify. Only valid with CNAME DNS names.\n- `static`: The type of edge IP configuration specified. Statically allocated edge IPs use customer IPs in accordance with the ips array you specify. Only valid with ADDRESS DNS names.",
			optional: true,
			choices: ["dynamic", "static"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "edge-ips-type", "text"),
		},
		"edge-ips-ips": {
			kind: "parsed",
			brief:
				"The array of customer owned IPs we broadcast via anycast for this hostname and application.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ip-firewall": {
			kind: "boolean",
			brief:
				"Enables IP Access Rules for this application.\nNotes: Only available for TCP applications.",
			optional: true,
		},
		"origin-direct": {
			kind: "parsed",
			brief:
				"List of origin IP addresses. Array may contain multiple IP addresses for load balancing.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"origin-dns-name": {
			kind: "parsed",
			brief: "The name of the DNS record associated with the origin.",
			optional: true,
			parse: String,
		},
		"origin-dns-ttl": {
			kind: "parsed",
			brief: "The TTL of our resolution of your DNS record in seconds.",
			optional: true,
			parse: Number,
		},
		"origin-dns-type": {
			kind: "parsed",
			brief:
				'The type of DNS record associated with the origin. "" is used to specify a combination of A/AAAA records.',
			optional: true,
			choices: ["A", "AAAA", "SRV"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "origin-dns-type", "text"),
		},
		"origin-port": {
			kind: "parsed",
			brief:
				'The destination port at the origin. Only specified in conjunction with origin_dns. May use an integer to specify a single origin port, for example `1000`, or a string to specify a range of origin ports, for example `"1000-2000"`.\nNotes: If specifying a port range, the number of ports in the range must match the number of ports specified in the "protocol" field. Accepts a JSON scalar or plain string, or @path/to/file.',
			optional: true,
			parse: String,
		},
		"origin-worker-id": {
			kind: "parsed",
			brief:
				'Optional Worker script tag (worker ID) to use as the application\'s origin. Requires traffic_type "worker"; mutually exclusive with origin_direct, origin_dns, origin_port, proxy_protocol, and argo_smart_routing. For TCP applications, tls may be "off" or "flexible"; UDP applications require tls "off".',
			optional: true,
			parse: String,
		},
		protocol: {
			kind: "parsed",
			brief:
				'The port configuration at Cloudflare\'s edge. May specify a single port, for example `"tcp/1000"`, or a range of ports, for example `"tcp/1000-2000"`.',
			optional: true,
			parse: String,
		},
		"proxy-protocol": {
			kind: "parsed",
			brief:
				"Enables Proxy Protocol to the origin. Refer to [Enable Proxy protocol](https://developers.cloudflare.com/spectrum/getting-started/proxy-protocol/) for implementation details on PROXY Protocol V1, PROXY Protocol V2, and Simple Proxy Protocol.",
			optional: true,
			choices: ["off", "v1", "v2", "simple"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "proxy-protocol", "text"),
		},
		tls: {
			kind: "parsed",
			brief: "The type of TLS termination associated with the application.",
			optional: true,
			choices: ["off", "flexible", "full", "strict"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "tls", "text"),
		},
		"traffic-type": {
			kind: "parsed",
			brief:
				'Variant descriptions:\n- `direct`, `http`, `https`, `worker`: Determines how data travels from the edge to your origin. When set to "direct", Spectrum will send traffic directly to your origin, and the application\'s type is derived from the `protocol`. When set to "http" or "https", Spectrum will apply Cloudflare\'s HTTP/HTTPS features as it sends traffic to your origin, and the application type matches this property exactly. When set to "worker", traffic is sent to the Worker specified by `origin_worker_id`.\n- Determines how traffic is sent to the origin. If absent or empty, defaults to "direct". Direct mode uses origin_direct. Worker mode requires origin_worker_id, TCP or UDP with a single port, and CNAME DNS; origin_worker_id and origin_direct are mutually exclusive. A PAYG zone may have at most one Worker application per transport (one TCP and one UDP); creating another for the same transport, or converting another application to Worker while that quota is full, is rejected with error code 11034 and HTTP status 400.',
			optional: true,
			choices: ["direct", "http", "https", "worker"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "traffic-type", "text"),
		},
		"virtual-network-id": {
			kind: "parsed",
			brief:
				"Optional UUID of a virtual network for routing origin traffic through tunnel virtual networks.",
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
		{ placeholder: "app-id", brief: "App identifier.", parse: String },
	],
	rules(rules) {
		rules.implies("argo-smart-routing", ["traffic-type"]);
		rules.implies("edge-alpn-protocols", ["traffic-type"]);
		rules.implies("edge-ips-connectivity", ["traffic-type"]);
		rules.implies("edge-ips-type", ["traffic-type"]);
		rules.implies("edge-ips-ips", ["traffic-type"]);
		rules.implies("ip-firewall", ["traffic-type"]);
		rules.implies("origin-dns-name", ["traffic-type"]);
		rules.implies("origin-dns-ttl", ["traffic-type"]);
		rules.implies("origin-dns-type", ["traffic-type"]);
		rules.implies("origin-port", ["traffic-type"]);
		rules.implies("proxy-protocol", ["traffic-type"]);
		rules.implies("tls", ["traffic-type"]);
		rules.implies("virtual-network-id", ["traffic-type"]);
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <app-id>",
	describe:
		"Update Spectrum application configuration using a name for the origin",
	usage:
		"$0 spectrum apps update <app-id>\n\nUpdates a previously existing application's configuration that uses a name for the origin.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
