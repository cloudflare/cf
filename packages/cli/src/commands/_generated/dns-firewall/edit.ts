/**
 * edit command
 * @generated from apis/overlays/dns-firewall.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"attack-mitigation-enabled": {
			kind: "boolean",
			brief:
				"When enabled, automatically mitigate random-prefix attacks to protect upstream DNS servers",
			optional: true,
		},
		"attack-mitigation-only-when-upstream-unhealthy": {
			kind: "boolean",
			brief: "Only mitigate attacks when upstream servers seem unhealthy",
			optional: true,
		},
		"deprecate-any-requests": {
			kind: "boolean",
			brief: "Whether to refuse to answer queries for the ANY type",
			optional: true,
		},
		"ecs-fallback": {
			kind: "boolean",
			brief:
				"Whether to forward client IP (resolver) subnet if no EDNS Client Subnet is sent",
			optional: true,
		},
		"maximum-cache-ttl": {
			kind: "parsed",
			brief:
				"By default, Cloudflare attempts to cache responses for as long as\nindicated by the TTL received from upstream nameservers. This setting\nsets an upper bound on this duration. For caching purposes, higher TTLs\nwill be decreased to the maximum value defined by this setting.\n\nThis setting does not affect the TTL value in the DNS response\nCloudflare returns to clients. Cloudflare will always forward the TTL\nvalue received from upstream nameservers.\n",
			optional: true,
			parse: Number,
		},
		"minimum-cache-ttl": {
			kind: "parsed",
			brief:
				"By default, Cloudflare attempts to cache responses for as long as\nindicated by the TTL received from upstream nameservers. This setting\nsets a lower bound on this duration. For caching purposes, lower TTLs\nwill be increased to the minimum value defined by this setting.\n\nThis setting does not affect the TTL value in the DNS response\nCloudflare returns to clients. Cloudflare will always forward the TTL\nvalue received from upstream nameservers.\n\nNote that, even with this setting, there is no guarantee that a\nresponse will be cached for at least the specified duration. Cached\nresponses may be removed earlier for capacity or other operational\nreasons.\n",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "DNS Firewall cluster name",
			optional: true,
			parse: String,
		},
		"negative-cache-ttl": {
			kind: "parsed",
			brief:
				"This setting controls how long DNS Firewall should cache negative\nresponses (e.g., NXDOMAIN) from the upstream servers.\n\nThis setting does not affect the TTL value in the DNS response\nCloudflare returns to clients. Cloudflare will always forward the TTL\nvalue received from upstream nameservers.\n",
			optional: true,
			parse: Number,
		},
		ratelimit: {
			kind: "parsed",
			brief:
				"Maximum number of DNS queries per second that will be forwarded to your upstream nameservers. The limit is enforced per server, where each server receives a fraction of the configured value. The actual aggregate rate for a data center may vary depending on how many servers are present. Responses served from cache do not count toward this limit. Set to null to disable rate limiting.",
			optional: true,
			parse: Number,
		},
		retries: {
			kind: "parsed",
			brief:
				"Number of retries for fetching DNS responses from upstream nameservers (not counting the initial attempt)",
			optional: true,
			parse: Number,
		},
		"upstream-ips": {
			kind: "parsed",
			brief: "The upstream_ips field",
			variadic: true,
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
		{ placeholder: "dns-firewall-id", brief: "Identifier.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <dns-firewall-id>",
	describe: "Update DNS Firewall Cluster",
	usage:
		"$0 dns-firewall edit <dns-firewall-id>\n\nModify the configuration of a DNS Firewall cluster",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
