import operation from "../../_operations/alerting/policies/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "alerting policies update",
			classification: {
				safeFlags: ["alert-type", "enabled", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf alerting policies update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/alerting/v3/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
					pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									alert_interval: resolveFileToken(
										argv["alert-interval"] as string | undefined,
										"alert-interval",
										"text"
									),
									alert_type: argv["alert-type"],
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									enabled: argv["enabled"],
									filters: {
										actions: argv["filters-actions"],
										affected_asns: argv["filters-affected-asns"],
										affected_components: argv["filters-affected-components"],
										affected_locations: argv["filters-affected-locations"],
										airport_code: argv["filters-airport-code"],
										alert_trigger_preferences:
											argv["filters-alert-trigger-preferences"],
										alert_trigger_preferences_value:
											argv["filters-alert-trigger-preferences-value"],
										check_id: argv["filters-check-id"],
										enabled: argv["filters-enabled"],
										environment: argv["filters-environment"],
										event: argv["filters-event"],
										event_source: argv["filters-event-source"],
										event_type: argv["filters-event-type"],
										group_by: argv["filters-group-by"],
										health_check_id: argv["filters-health-check-id"],
										incident_impact: argv["filters-incident-impact"],
										input_id: argv["filters-input-id"],
										insight_class: argv["filters-insight-class"],
										limit: argv["filters-limit"],
										logo_tag: argv["filters-logo-tag"],
										megabits_per_second: argv["filters-megabits-per-second"],
										new_health: argv["filters-new-health"],
										new_status: argv["filters-new-status"],
										packets_per_second: argv["filters-packets-per-second"],
										pool_id: argv["filters-pool-id"],
										pop_names: argv["filters-pop-names"],
										product: argv["filters-product"],
										project_id: argv["filters-project-id"],
										protocol: argv["filters-protocol"],
										query_id: argv["filters-query-id"],
										query_tag: argv["filters-query-tag"],
										requests_per_second: argv["filters-requests-per-second"],
										selectors: argv["filters-selectors"],
										services: argv["filters-services"],
										slo: argv["filters-slo"],
										status: argv["filters-status"],
										target_hostname: argv["filters-target-hostname"],
										target_ip: argv["filters-target-ip"],
										target_zone_name: argv["filters-target-zone-name"],
										token_id: argv["filters-token-id"],
										total_spend_dollars: argv["filters-total-spend-dollars"],
										traffic_exclusions: argv["filters-traffic-exclusions"],
										tunnel_id: argv["filters-tunnel-id"],
										tunnel_name: argv["filters-tunnel-name"],
										type: argv["filters-type"],
										where: argv["filters-where"],
										zones: argv["filters-zones"],
									},
									mechanisms: {
										email: parseObjectArray(
											argv["mechanisms-email"],
											"mechanisms-email"
										),
										pagerduty: parseObjectArray(
											argv["mechanisms-pagerduty"],
											"mechanisms-pagerduty"
										),
										webhooks: parseObjectArray(
											argv["mechanisms-webhooks"],
											"mechanisms-webhooks"
										),
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
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
						policy_id: argv["policy-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				alert_interval: resolveFileToken(
					argv["alert-interval"] as string | undefined,
					"alert-interval",
					"text"
				),
				alert_type: argv["alert-type"],
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				enabled: argv["enabled"],
				filters: {
					actions: argv["filters-actions"],
					affected_asns: argv["filters-affected-asns"],
					affected_components: argv["filters-affected-components"],
					affected_locations: argv["filters-affected-locations"],
					airport_code: argv["filters-airport-code"],
					alert_trigger_preferences: argv["filters-alert-trigger-preferences"],
					alert_trigger_preferences_value:
						argv["filters-alert-trigger-preferences-value"],
					check_id: argv["filters-check-id"],
					enabled: argv["filters-enabled"],
					environment: argv["filters-environment"],
					event: argv["filters-event"],
					event_source: argv["filters-event-source"],
					event_type: argv["filters-event-type"],
					group_by: argv["filters-group-by"],
					health_check_id: argv["filters-health-check-id"],
					incident_impact: argv["filters-incident-impact"],
					input_id: argv["filters-input-id"],
					insight_class: argv["filters-insight-class"],
					limit: argv["filters-limit"],
					logo_tag: argv["filters-logo-tag"],
					megabits_per_second: argv["filters-megabits-per-second"],
					new_health: argv["filters-new-health"],
					new_status: argv["filters-new-status"],
					packets_per_second: argv["filters-packets-per-second"],
					pool_id: argv["filters-pool-id"],
					pop_names: argv["filters-pop-names"],
					product: argv["filters-product"],
					project_id: argv["filters-project-id"],
					protocol: argv["filters-protocol"],
					query_id: argv["filters-query-id"],
					query_tag: argv["filters-query-tag"],
					requests_per_second: argv["filters-requests-per-second"],
					selectors: argv["filters-selectors"],
					services: argv["filters-services"],
					slo: argv["filters-slo"],
					status: argv["filters-status"],
					target_hostname: argv["filters-target-hostname"],
					target_ip: argv["filters-target-ip"],
					target_zone_name: argv["filters-target-zone-name"],
					token_id: argv["filters-token-id"],
					total_spend_dollars: argv["filters-total-spend-dollars"],
					traffic_exclusions: argv["filters-traffic-exclusions"],
					tunnel_id: argv["filters-tunnel-id"],
					tunnel_name: argv["filters-tunnel-name"],
					type: argv["filters-type"],
					where: argv["filters-where"],
					zones: argv["filters-zones"],
				},
				mechanisms: {
					email: parseObjectArray(argv["mechanisms-email"], "mechanisms-email"),
					pagerduty: parseObjectArray(
						argv["mechanisms-pagerduty"],
						"mechanisms-pagerduty"
					),
					webhooks: parseObjectArray(
						argv["mechanisms-webhooks"],
						"mechanisms-webhooks"
					),
				},
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					policy_id: argv["policy-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
