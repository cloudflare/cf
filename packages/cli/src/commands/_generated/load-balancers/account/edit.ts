import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/load-balancers.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 load-balancers account edit <load-balancer-id>\n\nApply changes to an existing account or zone-scoped load balancer, overwriting the supplied properties."
		)
		.positional("load-balancer-id", {
			type: "string",
			description: "Load balancer ID",
			demandOption: true,
		})
		.option("adaptive-routing-failover-across-pools", {
			type: "boolean",
			description:
				"Extends zero-downtime failover of requests to healthy origins from alternate pools, when no healthy alternate exists in the same pool, according to the failover order defined by traffic and origin steering. When set false (the default) zero-downtime failover will only occur between origins within the same pool. See `session_affinity_attributes` for control over when sessions are broken or reassigned.",
		})
		.option("default-pools", {
			type: "string",
			array: true,
			description:
				"A list of pool IDs ordered by their failover priority. Pools defined here are used by default, or when region_pools are not configured for a given region.",
		})
		.option("description", {
			type: "string",
			description: "Object description.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Whether to enable (the default) this load balancer.",
		})
		.option("fallback-pool", {
			type: "string",
			description:
				"The pool ID to use when all other pools are detected as unhealthy.",
		})
		.option("location-strategy-mode", {
			type: "string",
			description:
				'Determines the authoritative location when ECS is not preferred, does not exist in the request, or its GeoIP lookup is unsuccessful.\n- `"pop"`: Use the Cloudflare PoP location.\n- `"resolver_ip"`: Use the DNS resolver GeoIP location. If the GeoIP lookup is unsuccessful, use the Cloudflare PoP location.',
			choices: ["pop", "resolver_ip"],
		})
		.coerce("location-strategy-mode", (value) =>
			resolveFileToken(value, "location-strategy-mode", "text")
		)
		.option("location-strategy-prefer-ecs", {
			type: "string",
			description:
				'Whether the EDNS Client Subnet (ECS) GeoIP should be preferred as the authoritative location.\n- `"always"`: Always prefer ECS.\n- `"never"`: Never prefer ECS.\n- `"proximity"`: Prefer ECS only when `steering_policy="proximity"`.\n- `"geo"`: Prefer ECS only when `steering_policy="geo"`.',
			choices: ["always", "never", "proximity", "geo"],
		})
		.coerce("location-strategy-prefer-ecs", (value) =>
			resolveFileToken(value, "location-strategy-prefer-ecs", "text")
		)
		.option("name", {
			type: "string",
			description:
				"The DNS hostname to associate with your Load Balancer. If this hostname already exists as a DNS record in Cloudflare's DNS, the Load Balancer will take precedence and the DNS record will not be used.",
		})
		.option("networks", {
			type: "string",
			array: true,
			description: "List of networks where Load Balancer or Pool is enabled.",
		})
		.option("proxied", {
			type: "boolean",
			description:
				"Whether the hostname should be gray clouded (false) or orange clouded (true).",
		})
		.option("random-steering-default-weight", {
			type: "number",
			description:
				"The default weight for pools in the load balancer that are not specified in the pool_weights map.",
		})
		.option("rules", {
			type: "string",
			description:
				"BETA Field Not General Access: A list of rules for this load balancer to execute. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("session-affinity", {
			type: "string",
			description:
				'Specifies the type of session affinity the load balancer should use unless specified as `"none"`. The supported types are: - `"cookie"`: On the first request to a proxied load balancer, a cookie is generated, encoding information of which origin the request will be forwarded to. Subsequent requests, by the same client to the same load balancer, will be sent to the origin server the cookie encodes, for the duration of the cookie and as long as the origin server remains healthy. If the cookie has expired or the origin server is unhealthy, then a new origin server is calculated and used. - `"ip_cookie"`: Behaves the same as `"cookie"` except the initial origin selection is stable and based on the client\'s ip address. - `"header"`: On the first request to a proxied load balancer, a session key based on the configured HTTP headers (see `session_affinity_attributes.headers`) is generated, encoding the request headers used for storing in the load balancer session state which origin the request will be forwarded to. Subsequent requests to the load balancer with the same headers will be sent to the same origin server, for the duration of the session and as long as the origin server remains healthy. If the session has been idle for the duration of `session_affinity_ttl` seconds or the origin server is unhealthy, then a new origin server is calculated and used. See `headers` in `session_affinity_attributes` for additional required configuration.',
			choices: ["none", "cookie", "ip_cookie", "header"],
		})
		.coerce("session-affinity", (value) =>
			resolveFileToken(value, "session-affinity", "text")
		)
		.option("session-affinity-attributes-drain-duration", {
			type: "number",
			description:
				"Configures the drain duration in seconds. This field is only used when session affinity is enabled on the load balancer.",
		})
		.option("session-affinity-attributes-headers", {
			type: "string",
			array: true,
			description:
				'Configures the names of HTTP headers to base session affinity on when header `session_affinity` is enabled. At least one HTTP header name must be provided. To specify the exact cookies to be used, include an item in the following format: `"cookie:<cookie-name-1>,<cookie-name-2>"` (example) where everything after the colon is a comma-separated list of cookie names. Providing only `"cookie"` will result in all cookies being used. The default max number of HTTP header names that can be provided depends on your plan: 5 for Enterprise, 1 for all other plans.',
		})
		.option("session-affinity-attributes-require-all-headers", {
			type: "boolean",
			description:
				'When header `session_affinity` is enabled, this option can be used to specify how HTTP headers on load balancing requests will be used. The supported values are: - `"true"`: Load balancing requests must contain *all* of the HTTP headers specified by the `headers` session affinity attribute, otherwise sessions aren\'t created. - `"false"`: Load balancing requests must contain *at least one* of the HTTP headers specified by the `headers` session affinity attribute, otherwise sessions aren\'t created.',
		})
		.option("session-affinity-attributes-samesite", {
			type: "string",
			description:
				'Configures the SameSite attribute on session affinity cookie. Value "Auto" will be translated to "Lax" or "None" depending if Always Use HTTPS is enabled. Note: when using value "None", the secure attribute can not be set to "Never".',
			choices: ["Auto", "Lax", "None", "Strict"],
		})
		.coerce("session-affinity-attributes-samesite", (value) =>
			resolveFileToken(value, "session-affinity-attributes-samesite", "text")
		)
		.option("session-affinity-attributes-secure", {
			type: "string",
			description:
				'Configures the Secure attribute on session affinity cookie. Value "Always" indicates the Secure attribute will be set in the Set-Cookie header, "Never" indicates the Secure attribute will not be set, and "Auto" will set the Secure attribute depending if Always Use HTTPS is enabled.',
			choices: ["Auto", "Always", "Never"],
		})
		.coerce("session-affinity-attributes-secure", (value) =>
			resolveFileToken(value, "session-affinity-attributes-secure", "text")
		)
		.option("session-affinity-attributes-zero-downtime-failover", {
			type: "string",
			description:
				'Configures the zero-downtime failover between origins within a pool when session affinity is enabled. This feature is currently incompatible with Argo, Tiered Cache, and Bandwidth Alliance. The supported values are: - `"none"`: No failover takes place for sessions pinned to the origin (default). - `"temporary"`: Traffic will be sent to another other healthy origin until the originally pinned origin is available; note that this can potentially result in heavy origin flapping. - `"sticky"`: The session affinity cookie is updated and subsequent requests are sent to the new origin. Note: Zero-downtime failover with sticky sessions is currently not supported for session affinity by header.',
			choices: ["none", "temporary", "sticky"],
		})
		.coerce("session-affinity-attributes-zero-downtime-failover", (value) =>
			resolveFileToken(
				value,
				"session-affinity-attributes-zero-downtime-failover",
				"text"
			)
		)
		.option("session-affinity-ttl", {
			type: "number",
			description:
				'Time, in seconds, until a client\'s session expires after being created. Once the expiry time has been reached, subsequent requests may get sent to a different origin server. The accepted ranges per `session_affinity` policy are: - `"cookie"` / `"ip_cookie"`: The current default of 23 hours will be used unless explicitly set. The accepted range of values is between [1800, 604800]. - `"header"`: The current default of 1800 seconds will be used unless explicitly set. The accepted range of values is between [30, 3600]. Note: With session affinity by header, sessions only expire after they haven\'t been used for the number of seconds specified.',
		})
		.option("steering-policy", {
			type: "string",
			description:
				'Steering Policy for this load balancer.\n- `"off"`: Use `default_pools`.\n- `"geo"`: Use `region_pools`/`country_pools`/`pop_pools`. For non-proxied requests, the country for `country_pools` is determined by `location_strategy`.\n- `"random"`: Select a pool randomly.\n- `"dynamic_latency"`: Use round trip time to select the closest pool in default_pools (requires pool health checks).\n- `"proximity"`: Use the pools\' latitude and longitude to select the closest pool using the Cloudflare PoP location for proxied requests or the location determined by `location_strategy` for non-proxied requests.\n- `"least_outstanding_requests"`: Select a pool by taking into consideration `random_steering` weights, as well as each pool\'s number of outstanding requests. Pools with more pending requests are weighted proportionately less relative to others.\n- `"least_connections"`: Select a pool by taking into consideration `random_steering` weights, as well as each pool\'s number of open connections. Pools with more open connections are weighted proportionately less relative to others. Supported for HTTP/1 and HTTP/2 connections.\n- `""`: Will map to `"geo"` if you use `region_pools`/`country_pools`/`pop_pools` otherwise `"off"`.',
			choices: [
				"off",
				"geo",
				"random",
				"dynamic_latency",
				"proximity",
				"least_outstanding_requests",
				"least_connections",
			],
		})
		.coerce("steering-policy", (value) =>
			resolveFileToken(value, "steering-policy", "text")
		)
		.option("ttl", {
			type: "number",
			description:
				"Time to live (TTL) of the DNS entry for the IP address returned by this load balancer. This only applies to gray-clouded (unproxied) load balancers.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"The editable properties shared by load balancer create, update, and patch requests. Operations layer their own \`required\` constraints on top via \`allOf\`.",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:patch:/{account_or_zone}/{account_or_zone_id}/load_balancers/{load_balancer_id}">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <load-balancer-id>",
	describe: "Patch account or zone Load Balancer",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "load-balancers account edit",
				classification: {
					safeFlags: [
						"adaptive-routing-failover-across-pools",
						"enabled",
						"location-strategy-mode",
						"location-strategy-prefer-ecs",
						"proxied",
						"session-affinity",
						"session-affinity-attributes-require-all-headers",
						"session-affinity-attributes-samesite",
						"session-affinity-attributes-secure",
						"session-affinity-attributes-zero-downtime-failover",
						"steering-policy",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf load-balancers account edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/load_balancers/${argv["load-balancer-id"] == null ? "<load-balancer-id>" : encodeURIComponent(String(argv["load-balancer-id"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
							"load-balancer-id": String(argv["load-balancer-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										adaptive_routing: {
											failover_across_pools:
												argv["adaptive-routing-failover-across-pools"],
										},
										default_pools: argv["default-pools"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										fallback_pool: resolveFileToken(
											argv["fallback-pool"] as string | undefined,
											"fallback-pool",
											"text"
										),
										location_strategy: {
											mode: argv["location-strategy-mode"],
											prefer_ecs: argv["location-strategy-prefer-ecs"],
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										networks: argv["networks"],
										proxied: argv["proxied"],
										random_steering: {
											default_weight: argv["random-steering-default-weight"],
										},
										rules: parseObjectArray(argv["rules"], "rules"),
										session_affinity: argv["session-affinity"],
										session_affinity_attributes: {
											drain_duration:
												argv["session-affinity-attributes-drain-duration"],
											headers: argv["session-affinity-attributes-headers"],
											require_all_headers:
												argv["session-affinity-attributes-require-all-headers"],
											samesite: argv["session-affinity-attributes-samesite"],
											secure: argv["session-affinity-attributes-secure"],
											zero_downtime_failover:
												argv[
													"session-affinity-attributes-zero-downtime-failover"
												],
										},
										session_affinity_ttl: argv["session-affinity-ttl"],
										steering_policy: argv["steering-policy"],
										ttl: argv["ttl"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.loadBalancers.account.edit({
							body: bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							load_balancer_id: argv["load-balancer-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					adaptive_routing: {
						failover_across_pools:
							argv["adaptive-routing-failover-across-pools"],
					},
					default_pools: argv["default-pools"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					fallback_pool: resolveFileToken(
						argv["fallback-pool"] as string | undefined,
						"fallback-pool",
						"text"
					),
					location_strategy: {
						mode: argv["location-strategy-mode"],
						prefer_ecs: argv["location-strategy-prefer-ecs"],
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					networks: argv["networks"],
					proxied: argv["proxied"],
					random_steering: {
						default_weight: argv["random-steering-default-weight"],
					},
					rules: parseObjectArray(argv["rules"], "rules"),
					session_affinity: argv["session-affinity"],
					session_affinity_attributes: {
						drain_duration: argv["session-affinity-attributes-drain-duration"],
						headers: argv["session-affinity-attributes-headers"],
						require_all_headers:
							argv["session-affinity-attributes-require-all-headers"],
						samesite: argv["session-affinity-attributes-samesite"],
						secure: argv["session-affinity-attributes-secure"],
						zero_downtime_failover:
							argv["session-affinity-attributes-zero-downtime-failover"],
					},
					session_affinity_ttl: argv["session-affinity-ttl"],
					steering_policy: argv["steering-policy"],
					ttl: argv["ttl"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.loadBalancers.account.edit({
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						load_balancer_id: argv["load-balancer-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
