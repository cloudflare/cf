import operation from "../../_operations/load-balancers/account/edit.js";
/**
 * edit command
 * @generated from apis/overlays/load-balancers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <load-balancer-id>",
	describe: "Patch account or zone Load Balancer",
	usage:
		"$0 load-balancers account edit <load-balancer-id>\n\nApply changes to an existing account or zone-scoped load balancer, overwriting the supplied properties.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"adaptive-routing-failover-across-pools": {
			kind: "boolean",
			brief:
				"Extends zero-downtime failover of requests to healthy origins from alternate pools, when no healthy alternate exists in the same pool, according to the failover order defined by traffic and origin steering. When set false (the default) zero-downtime failover will only occur between origins within the same pool. See `session_affinity_attributes` for control over when sessions are broken or reassigned.",
			optional: true,
		},
		"country-pools": {
			kind: "parsed",
			brief:
				'A mapping of country codes to a list of pool IDs (ordered by their failover priority) for the given country. Any country not explicitly defined will fall back to using the corresponding region_pool mapping if it exists else to default_pools. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		"default-pools": {
			kind: "parsed",
			brief:
				"A list of pool IDs ordered by their failover priority. Pools defined here are used by default, or when region_pools are not configured for a given region.",
			variadic: true,
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Object description.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether to enable (the default) this load balancer.",
			optional: true,
		},
		"fallback-pool": {
			kind: "parsed",
			brief:
				"The pool ID to use when all other pools are detected as unhealthy.",
			optional: true,
			parse: String,
		},
		"location-strategy-mode": {
			kind: "parsed",
			brief:
				'Determines the authoritative location when ECS is not preferred, does not exist in the request, or its GeoIP lookup is unsuccessful.\n- `"pop"`: Use the Cloudflare PoP location.\n- `"resolver_ip"`: Use the DNS resolver GeoIP location. If the GeoIP lookup is unsuccessful, use the Cloudflare PoP location.',
			optional: true,
			choices: ["pop", "resolver_ip"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "location-strategy-mode", "text"),
		},
		"location-strategy-prefer-ecs": {
			kind: "parsed",
			brief:
				'Whether the EDNS Client Subnet (ECS) GeoIP should be preferred as the authoritative location.\n- `"always"`: Always prefer ECS.\n- `"never"`: Never prefer ECS.\n- `"proximity"`: Prefer ECS only when `steering_policy="proximity"`.\n- `"geo"`: Prefer ECS only when `steering_policy="geo"`.',
			optional: true,
			choices: ["always", "never", "proximity", "geo"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "location-strategy-prefer-ecs", "text"),
		},
		name: {
			kind: "parsed",
			brief:
				"The DNS hostname to associate with your Load Balancer. If this hostname already exists as a DNS record in Cloudflare's DNS, the Load Balancer will take precedence and the DNS record will not be used.",
			optional: true,
			parse: String,
		},
		networks: {
			kind: "parsed",
			brief: "List of networks where Load Balancer or Pool is enabled.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"pool-sets": {
			kind: "parsed",
			brief:
				'An optional list of pool sets, evaluated in array order with first match wins. Pool sets are independent from the standard steering fields (`region_pools` / `country_pools` / `pop_pools` / `default_pools` / `steering_policy` / `random_steering` / `fallback_pool` / `rules`). On a PATCH, an empty array (`pool_sets: []`) clears all pool sets, while omitting the field leaves existing pool sets unchanged. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"disabled"?: boolean, "fixed_response"?: {...}, "match"?: {...}, "name"?: string, "overrides"?: {...}}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"pop-pools": {
			kind: "parsed",
			brief:
				'Enterprise only: A mapping of Cloudflare PoP identifiers to a list of pool IDs (ordered by their failover priority) for the PoP (datacenter). Any PoPs not explicitly defined will fall back to using the corresponding country_pool, then region_pool mapping if it exists else to default_pools. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		proxied: {
			kind: "boolean",
			brief:
				"Whether the hostname should be gray clouded (false) or orange clouded (true).",
			optional: true,
		},
		"random-steering-default-weight": {
			kind: "parsed",
			brief:
				"The default weight for pools in the load balancer that are not specified in the pool_weights map.",
			optional: true,
			parse: Number,
		},
		"random-steering-pool-weights": {
			kind: "parsed",
			brief:
				'A mapping of pool IDs to custom weights. The weight is relative to other pools in the load balancer. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": number}.',
			optional: true,
			parse: String,
		},
		"region-pools": {
			kind: "parsed",
			brief:
				'A mapping of region codes to a list of pool IDs (ordered by their failover priority) for the given region. Any regions not explicitly defined will fall back to using default_pools. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		rules: {
			kind: "parsed",
			brief:
				'BETA Field Not General Access: A list of rules for this load balancer to execute. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"condition"?: string, "disabled"?: boolean, "fixed_response"?: {...}, "name"?: string, "overrides"?: {...}, ...more}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"session-affinity": {
			kind: "parsed",
			brief:
				'Specifies the type of session affinity the load balancer should use unless specified as `"none"`. The supported types are: - `"cookie"`: On the first request to a proxied load balancer, a cookie is generated, encoding information of which origin the request will be forwarded to. Subsequent requests, by the same client to the same load balancer, will be sent to the origin server the cookie encodes, for the duration of the cookie and as long as the origin server remains healthy. If the cookie has expired or the origin server is unhealthy, then a new origin server is calculated and used. - `"ip_cookie"`: Behaves the same as `"cookie"` except the initial origin selection is stable and based on the client\'s ip address. - `"header"`: On the first request to a proxied load balancer, a session key based on the configured HTTP headers (see `session_affinity_attributes.headers`) is generated, encoding the request headers used for storing in the load balancer session state which origin the request will be forwarded to. Subsequent requests to the load balancer with the same headers will be sent to the same origin server, for the duration of the session and as long as the origin server remains healthy. If the session has been idle for the duration of `session_affinity_ttl` seconds or the origin server is unhealthy, then a new origin server is calculated and used. See `headers` in `session_affinity_attributes` for additional required configuration.',
			optional: true,
			choices: ["none", "cookie", "ip_cookie", "header"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "session-affinity", "text"),
		},
		"session-affinity-attributes-drain-duration": {
			kind: "parsed",
			brief:
				"Configures the drain duration in seconds. This field is only used when session affinity is enabled on the load balancer.",
			optional: true,
			parse: Number,
		},
		"session-affinity-attributes-headers": {
			kind: "parsed",
			brief:
				'Configures the names of HTTP headers to base session affinity on when header `session_affinity` is enabled. At least one HTTP header name must be provided. To specify the exact cookies to be used, include an item in the following format: `"cookie:<cookie-name-1>,<cookie-name-2>"` (example) where everything after the colon is a comma-separated list of cookie names. Providing only `"cookie"` will result in all cookies being used. The default max number of HTTP header names that can be provided depends on your plan: 5 for Enterprise, 1 for all other plans.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"session-affinity-attributes-require-all-headers": {
			kind: "boolean",
			brief:
				'When header `session_affinity` is enabled, this option can be used to specify how HTTP headers on load balancing requests will be used. The supported values are: - `"true"`: Load balancing requests must contain *all* of the HTTP headers specified by the `headers` session affinity attribute, otherwise sessions aren\'t created. - `"false"`: Load balancing requests must contain *at least one* of the HTTP headers specified by the `headers` session affinity attribute, otherwise sessions aren\'t created.',
			optional: true,
		},
		"session-affinity-attributes-samesite": {
			kind: "parsed",
			brief:
				'Configures the SameSite attribute on session affinity cookie. Value "Auto" will be translated to "Lax" or "None" depending if Always Use HTTPS is enabled. Note: when using value "None", the secure attribute can not be set to "Never".',
			optional: true,
			choices: ["Auto", "Lax", "None", "Strict"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "session-affinity-attributes-samesite", "text"),
		},
		"session-affinity-attributes-secure": {
			kind: "parsed",
			brief:
				'Configures the Secure attribute on session affinity cookie. Value "Always" indicates the Secure attribute will be set in the Set-Cookie header, "Never" indicates the Secure attribute will not be set, and "Auto" will set the Secure attribute depending if Always Use HTTPS is enabled.',
			optional: true,
			choices: ["Auto", "Always", "Never"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "session-affinity-attributes-secure", "text"),
		},
		"session-affinity-attributes-zero-downtime-failover": {
			kind: "parsed",
			brief:
				'Configures the zero-downtime failover between origins within a pool when session affinity is enabled. This feature is currently incompatible with Argo, Tiered Cache, and Bandwidth Alliance. The supported values are: - `"none"`: No failover takes place for sessions pinned to the origin (default). - `"temporary"`: Traffic will be sent to another other healthy origin until the originally pinned origin is available; note that this can potentially result in heavy origin flapping. - `"sticky"`: The session affinity cookie is updated and subsequent requests are sent to the new origin. Note: Zero-downtime failover with sticky sessions is currently not supported for session affinity by header.',
			optional: true,
			choices: ["none", "temporary", "sticky"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"session-affinity-attributes-zero-downtime-failover",
					"text"
				),
		},
		"session-affinity-ttl": {
			kind: "parsed",
			brief:
				'Time, in seconds, until a client\'s session expires after being created. Once the expiry time has been reached, subsequent requests may get sent to a different origin server. The accepted ranges per `session_affinity` policy are: - `"cookie"` / `"ip_cookie"`: The current default of 23 hours will be used unless explicitly set. The accepted range of values is between [1800, 604800]. - `"header"`: The current default of 1800 seconds will be used unless explicitly set. The accepted range of values is between [30, 3600]. Note: With session affinity by header, sessions only expire after they haven\'t been used for the number of seconds specified.',
			optional: true,
			parse: Number,
		},
		"steering-policy": {
			kind: "parsed",
			brief:
				'Steering Policy for this load balancer.\n- `"off"`: Use `default_pools`.\n- `"geo"`: Use `region_pools`/`country_pools`/`pop_pools`. For non-proxied requests, the country for `country_pools` is determined by `location_strategy`.\n- `"random"`: Select a pool randomly.\n- `"dynamic_latency"`: Use round trip time to select the closest pool in default_pools (requires pool health checks).\n- `"proximity"`: Use the pools\' latitude and longitude to select the closest pool using the Cloudflare PoP location for proxied requests or the location determined by `location_strategy` for non-proxied requests.\n- `"least_outstanding_requests"`: Select a pool by taking into consideration `random_steering` weights, as well as each pool\'s number of outstanding requests. Pools with more pending requests are weighted proportionately less relative to others.\n- `"least_connections"`: Select a pool by taking into consideration `random_steering` weights, as well as each pool\'s number of open connections. Pools with more open connections are weighted proportionately less relative to others. Supported for HTTP/1 and HTTP/2 connections.\n- `""`: Will map to `"geo"` if you use `region_pools`/`country_pools`/`pop_pools` otherwise `"off"`.',
			optional: true,
			choices: [
				"off",
				"geo",
				"random",
				"dynamic_latency",
				"proximity",
				"least_outstanding_requests",
				"least_connections",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "steering-policy", "text"),
		},
		ttl: {
			kind: "parsed",
			brief:
				"Time to live (TTL) of the DNS entry for the IP address returned by this load balancer. This only applies to gray-clouded (unproxied) load balancers.",
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
	operands: [
		{
			placeholder: "load-balancer-id",
			brief: "Load balancer ID",
			parse: String,
		},
	],
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
				} satisfies ArgClassification<typeof argv>,
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
								: compactBody(
										{
											adaptive_routing: {
												failover_across_pools:
													argv["adaptive-routing-failover-across-pools"],
											},
											country_pools: parseJsonMap(
												argv["country-pools"],
												"country-pools"
											),
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
											pool_sets: parseObjectArray(
												argv["pool-sets"],
												"pool-sets"
											),
											pop_pools: parseJsonMap(argv["pop-pools"], "pop-pools"),
											proxied: argv["proxied"],
											random_steering: {
												default_weight: argv["random-steering-default-weight"],
												pool_weights: parseJsonMap(
													argv["random-steering-pool-weights"],
													"random-steering-pool-weights"
												),
											},
											region_pools: parseJsonMap(
												argv["region-pools"],
												"region-pools"
											),
											rules: parseObjectArray(argv["rules"], "rules"),
											session_affinity: argv["session-affinity"],
											session_affinity_attributes: {
												drain_duration:
													argv["session-affinity-attributes-drain-duration"],
												headers: argv["session-affinity-attributes-headers"],
												require_all_headers:
													argv[
														"session-affinity-attributes-require-all-headers"
													],
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
										},
										[
											["country_pools"],
											["pop_pools"],
											["random_steering", "pool_weights"],
											["region_pools"],
										]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
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

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
							load_balancer_id: argv["load-balancer-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						adaptive_routing: {
							failover_across_pools:
								argv["adaptive-routing-failover-across-pools"],
						},
						country_pools: parseJsonMap(argv["country-pools"], "country-pools"),
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
						pool_sets: parseObjectArray(argv["pool-sets"], "pool-sets"),
						pop_pools: parseJsonMap(argv["pop-pools"], "pop-pools"),
						proxied: argv["proxied"],
						random_steering: {
							default_weight: argv["random-steering-default-weight"],
							pool_weights: parseJsonMap(
								argv["random-steering-pool-weights"],
								"random-steering-pool-weights"
							),
						},
						region_pools: parseJsonMap(argv["region-pools"], "region-pools"),
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
								argv["session-affinity-attributes-zero-downtime-failover"],
						},
						session_affinity_ttl: argv["session-affinity-ttl"],
						steering_policy: argv["steering-policy"],
						ttl: argv["ttl"],
					},
					[
						["country_pools"],
						["pop_pools"],
						["random_steering", "pool_weights"],
						["region_pools"],
					]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						load_balancer_id: argv["load-balancer-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
