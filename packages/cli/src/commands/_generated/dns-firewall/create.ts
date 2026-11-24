import operation from "../_operations/dns-firewall/create.js";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create DNS Firewall Cluster",
	usage: "$0 dns-firewall create\n\nCreate a DNS Firewall cluster",
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
			default: "900",
			parse: Number,
		},
		"minimum-cache-ttl": {
			kind: "parsed",
			brief:
				"By default, Cloudflare attempts to cache responses for as long as\nindicated by the TTL received from upstream nameservers. This setting\nsets a lower bound on this duration. For caching purposes, lower TTLs\nwill be increased to the minimum value defined by this setting.\n\nThis setting does not affect the TTL value in the DNS response\nCloudflare returns to clients. Cloudflare will always forward the TTL\nvalue received from upstream nameservers.\n\nNote that, even with this setting, there is no guarantee that a\nresponse will be cached for at least the specified duration. Cached\nresponses may be removed earlier for capacity or other operational\nreasons.\n",
			default: "60",
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
			default: "2",
			parse: Number,
		},
		"upstream-ips": {
			kind: "parsed",
			brief: "The upstream_ips field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dns-firewall-ip-count": {
			kind: "parsed",
			brief:
				"Number of IPv4 addresses to assign to the DNS Firewall cluster. Only used during cluster creation and cannot be changed later.",
			default: "2",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns-firewall create",
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
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"DNS Firewall cluster name"
						);
					}
					if (argv["upstream-ips"] === undefined) {
						throw new Error(
							"--upstream-ips is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns-firewall create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_firewall`,
						pathParams: {},
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
										dns_firewall_ip_count: argv["dns-firewall-ip-count"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

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
					dns_firewall_ip_count: argv["dns-firewall-ip-count"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
