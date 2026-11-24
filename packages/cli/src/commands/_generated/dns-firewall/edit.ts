import operation from "../_operations/dns-firewall/edit.js";
/**
 * edit command
 * @generated from apis/overlays/dns-firewall.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <dns-firewall-id>",
	describe: "Update DNS Firewall Cluster",
	usage:
		"$0 dns-firewall edit <dns-firewall-id>\n\nModify the configuration of a DNS Firewall cluster",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns-firewall edit",
				classification: {
					safeFlags: [
						"attack-mitigation-enabled",
						"attack-mitigation-only-when-upstream-unhealthy",
						"deprecate-any-requests",
						"ecs-fallback",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns-firewall edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_firewall/${argv["dns-firewall-id"] == null ? "<dns-firewall-id>" : encodeURIComponent(String(argv["dns-firewall-id"]))}`,
						pathParams: {
							"dns-firewall-id": String(argv["dns-firewall-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										attack_mitigation: {
											enabled: argv["attack-mitigation-enabled"],
											only_when_upstream_unhealthy:
												argv["attack-mitigation-only-when-upstream-unhealthy"],
										},
										deprecate_any_requests: argv["deprecate-any-requests"],
										ecs_fallback: argv["ecs-fallback"],
										maximum_cache_ttl: argv["maximum-cache-ttl"],
										minimum_cache_ttl: argv["minimum-cache-ttl"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										negative_cache_ttl: argv["negative-cache-ttl"],
										ratelimit: argv["ratelimit"],
										retries: argv["retries"],
										upstream_ips: argv["upstream-ips"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							dns_firewall_id: argv["dns-firewall-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					attack_mitigation: {
						enabled: argv["attack-mitigation-enabled"],
						only_when_upstream_unhealthy:
							argv["attack-mitigation-only-when-upstream-unhealthy"],
					},
					deprecate_any_requests: argv["deprecate-any-requests"],
					ecs_fallback: argv["ecs-fallback"],
					maximum_cache_ttl: argv["maximum-cache-ttl"],
					minimum_cache_ttl: argv["minimum-cache-ttl"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					negative_cache_ttl: argv["negative-cache-ttl"],
					ratelimit: argv["ratelimit"],
					retries: argv["retries"],
					upstream_ips: argv["upstream-ips"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dns_firewall_id: argv["dns-firewall-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
