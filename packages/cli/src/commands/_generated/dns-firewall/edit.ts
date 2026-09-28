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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/dns-firewall.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dns-firewall edit <dns-firewall-id>\n\nModify the configuration of a DNS Firewall cluster"
		)
		.positional("dns-firewall-id", {
			type: "string",
			description: "Identifier.",
			demandOption: true,
		})
		.option("attack-mitigation-enabled", {
			type: "boolean",
			description:
				"When enabled, automatically mitigate random-prefix attacks to protect upstream DNS servers",
		})
		.option("attack-mitigation-only-when-upstream-unhealthy", {
			type: "boolean",
			description: "Only mitigate attacks when upstream servers seem unhealthy",
		})
		.option("deprecate-any-requests", {
			type: "boolean",
			description: "Whether to refuse to answer queries for the ANY type",
		})
		.option("ecs-fallback", {
			type: "boolean",
			description:
				"Whether to forward client IP (resolver) subnet if no EDNS Client Subnet is sent",
		})
		.option("maximum-cache-ttl", {
			type: "number",
			description:
				"By default, Cloudflare attempts to cache responses for as long as\nindicated by the TTL received from upstream nameservers. This setting\nsets an upper bound on this duration. For caching purposes, higher TTLs\nwill be decreased to the maximum value defined by this setting.\n\nThis setting does not affect the TTL value in the DNS response\nCloudflare returns to clients. Cloudflare will always forward the TTL\nvalue received from upstream nameservers.\n",
		})
		.option("minimum-cache-ttl", {
			type: "number",
			description:
				"By default, Cloudflare attempts to cache responses for as long as\nindicated by the TTL received from upstream nameservers. This setting\nsets a lower bound on this duration. For caching purposes, lower TTLs\nwill be increased to the minimum value defined by this setting.\n\nThis setting does not affect the TTL value in the DNS response\nCloudflare returns to clients. Cloudflare will always forward the TTL\nvalue received from upstream nameservers.\n\nNote that, even with this setting, there is no guarantee that a\nresponse will be cached for at least the specified duration. Cached\nresponses may be removed earlier for capacity or other operational\nreasons.\n",
		})
		.option("name", {
			type: "string",
			description: "DNS Firewall cluster name",
		})
		.option("negative-cache-ttl", {
			type: "number",
			description:
				"This setting controls how long DNS Firewall should cache negative\nresponses (e.g., NXDOMAIN) from the upstream servers.\n\nThis setting does not affect the TTL value in the DNS response\nCloudflare returns to clients. Cloudflare will always forward the TTL\nvalue received from upstream nameservers.\n",
		})
		.option("ratelimit", {
			type: "number",
			description:
				"Maximum number of DNS queries per second that will be forwarded to your upstream nameservers. The limit is enforced per server, where each server receives a fraction of the configured value. The actual aggregate rate for a data center may vary depending on how many servers are present. Responses served from cache do not count toward this limit. Set to null to disable rate limiting.",
		})
		.option("retries", {
			type: "number",
			description:
				"Number of retries for fetching DNS responses from upstream nameservers (not counting the initial attempt)",
		})
		.option("upstream-ips", {
			type: "string",
			array: true,
			description: "The upstream_ips field",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dns-firewall-update-dns-firewall-cluster">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <dns-firewall-id>",
	describe: "Update DNS Firewall Cluster",
	builder,
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
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.dnsFirewall.edit({
							...bodyData,
							account_id: accountId,
							dns_firewall_id: argv["dns-firewall-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.dnsFirewall.edit({
						...bodyData,
						account_id: accountId,
						dns_firewall_id: argv["dns-firewall-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
