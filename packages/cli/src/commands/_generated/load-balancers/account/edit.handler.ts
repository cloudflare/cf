import operation from "../../_operations/load-balancers/account/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
					argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
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
					? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })
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
	);
}
