import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/alerting.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 alerting policies create\n\nCreates a new Notification policy.")
		.option("alert-interval", {
			type: "string",
			description:
				"Optional specification of how often to re-alert from the same incident, not support on all alert types.",
		})
		.option("alert-type", {
			type: "string",
			description:
				"Refers to which event will trigger a Notification dispatch. You can use the endpoint to get available alert types which then will give you a list of possible values.",
			choices: [
				"abuse_report_alert",
				"access_custom_certificate_expiration_type",
				"advanced_ddos_attack_l4_alert",
				"advanced_ddos_attack_l7_alert",
				"advanced_http_alert_error",
				"bgp_hijack_notification",
				"billing_usage_alert",
				"block_notification_block_removed",
				"block_notification_new_block",
				"block_notification_review_rejected",
				"bot_traffic_basic_alert",
				"brand_protection_alert",
				"brand_protection_digest",
				"clickhouse_alert_fw_anomaly",
				"clickhouse_alert_fw_ent_anomaly",
				"cloudforce_one_request_notification",
				"cni_maintenance_notification",
				"custom_analytics",
				"custom_bot_detection_alert",
				"custom_ssl_certificate_event_type",
				"dedicated_ssl_certificate_event_type",
				"device_connectivity_anomaly_alert",
				"dos_attack_l4",
				"dos_attack_l7",
				"expiring_service_token_alert",
				"failing_logpush_job_disabled_alert",
				"fbm_auto_advertisement",
				"fbm_dosd_attack",
				"fbm_volumetric_attack",
				"health_check_status_notification",
				"hostname_aop_custom_certificate_expiration_type",
				"http_alert_edge_error",
				"http_alert_origin_error",
				"image_notification",
				"image_resizing_notification",
				"incident_alert",
				"load_balancing_health_alert",
				"load_balancing_pool_enablement_alert",
				"logo_match_alert",
				"magic_tunnel_health_check_event",
				"magic_wan_tunnel_health",
				"maintenance_event_notification",
				"mtls_certificate_store_certificate_expiration_type",
				"pages_event_alert",
				"radar_notification",
				"real_origin_monitoring",
				"scriptmonitor_alert_new_code_change_detections",
				"scriptmonitor_alert_new_hosts",
				"scriptmonitor_alert_new_malicious_hosts",
				"scriptmonitor_alert_new_malicious_scripts",
				"scriptmonitor_alert_new_malicious_url",
				"scriptmonitor_alert_new_max_length_resource_url",
				"scriptmonitor_alert_new_resources",
				"secondary_dns_all_primaries_failing",
				"secondary_dns_primaries_failing",
				"secondary_dns_warning",
				"secondary_dns_zone_successfully_updated",
				"secondary_dns_zone_validation_warning",
				"security_insights_alert",
				"sentinel_alert",
				"stream_live_notifications",
				"synthetic_test_latency_alert",
				"synthetic_test_low_availability_alert",
				"traffic_anomalies_alert",
				"tunnel_health_event",
				"tunnel_update_event",
				"universal_ssl_event_type",
				"web_analytics_metrics_update",
				"zone_aop_custom_certificate_expiration_type",
			],
		})
		.coerce("alert-type", (value: string | undefined) =>
			resolveFileToken(value, "alert-type", "text")
		)
		.option("description", {
			type: "string",
			description: "Optional description for the Notification policy.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Whether or not the Notification policy is enabled.",
			default: true,
		})
		.option("filters-actions", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-affected-asns", {
			type: "string",
			array: true,
			description: "Used for configuring radar_notification",
		})
		.option("filters-affected-components", {
			type: "string",
			array: true,
			description: "Used for configuring incident_alert",
		})
		.option("filters-affected-locations", {
			type: "string",
			array: true,
			description: "Used for configuring radar_notification",
		})
		.option("filters-airport-code", {
			type: "string",
			array: true,
			description: "Used for configuring maintenance_event_notification",
		})
		.option("filters-alert-trigger-preferences", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-alert-trigger-preferences-value", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-enabled", {
			type: "string",
			array: true,
			description: "Used for configuring load_balancing_pool_enablement_alert",
		})
		.option("filters-environment", {
			type: "string",
			array: true,
			description: "Used for configuring pages_event_alert",
		})
		.option("filters-event", {
			type: "string",
			array: true,
			description: "Used for configuring pages_event_alert",
		})
		.option("filters-event-source", {
			type: "string",
			array: true,
			description: "Used for configuring load_balancing_health_alert",
		})
		.option("filters-event-type", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-group-by", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-health-check-id", {
			type: "string",
			array: true,
			description: "Used for configuring health_check_status_notification",
		})
		.option("filters-incident-impact", {
			type: "string",
			array: true,
			description: "Used for configuring incident_alert",
		})
		.option("filters-input-id", {
			type: "string",
			array: true,
			description: "Used for configuring stream_live_notifications",
		})
		.option("filters-insight-class", {
			type: "string",
			array: true,
			description: "Used for configuring security_insights_alert",
		})
		.option("filters-limit", {
			type: "string",
			array: true,
			description: "Used for configuring billing_usage_alert",
		})
		.option("filters-logo-tag", {
			type: "string",
			array: true,
			description: "Used for configuring logo_match_alert",
		})
		.option("filters-megabits-per-second", {
			type: "string",
			array: true,
			description: "Used for configuring advanced_ddos_attack_l4_alert",
		})
		.option("filters-new-health", {
			type: "string",
			array: true,
			description: "Used for configuring load_balancing_health_alert",
		})
		.option("filters-new-status", {
			type: "string",
			array: true,
			description: "Used for configuring tunnel_health_event",
		})
		.option("filters-packets-per-second", {
			type: "string",
			array: true,
			description: "Used for configuring advanced_ddos_attack_l4_alert",
		})
		.option("filters-pool-id", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-pop-names", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-product", {
			type: "string",
			array: true,
			description: "Used for configuring billing_usage_alert",
		})
		.option("filters-project-id", {
			type: "string",
			array: true,
			description: "Used for configuring pages_event_alert",
		})
		.option("filters-protocol", {
			type: "string",
			array: true,
			description: "Used for configuring advanced_ddos_attack_l4_alert",
		})
		.option("filters-query-tag", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-requests-per-second", {
			type: "string",
			array: true,
			description: "Used for configuring advanced_ddos_attack_l7_alert",
		})
		.option("filters-selectors", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-services", {
			type: "string",
			array: true,
			description: "Used for configuring clickhouse_alert_fw_ent_anomaly",
		})
		.option("filters-slo", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-status", {
			type: "string",
			array: true,
			description: "Used for configuring health_check_status_notification",
		})
		.option("filters-target-hostname", {
			type: "string",
			array: true,
			description: "Used for configuring advanced_ddos_attack_l7_alert",
		})
		.option("filters-target-ip", {
			type: "string",
			array: true,
			description: "Used for configuring advanced_ddos_attack_l4_alert",
		})
		.option("filters-target-zone-name", {
			type: "string",
			array: true,
			description: "Used for configuring advanced_ddos_attack_l7_alert",
		})
		.option("filters-token-id", {
			type: "string",
			array: true,
			description:
				"Access service token IDs to include for expiring_service_token_alert. Omit this property to include all current and future service tokens.",
		})
		.option("filters-traffic-exclusions", {
			type: "string",
			array: true,
			description: "Used for configuring traffic_anomalies_alert",
		})
		.option("filters-tunnel-id", {
			type: "string",
			array: true,
			description: "Used for configuring tunnel_health_event",
		})
		.option("filters-tunnel-name", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-type", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-where", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("filters-zones", {
			type: "string",
			array: true,
			description: "Usage depends on specific alert type",
		})
		.option("name", { type: "string", description: "Name of the policy." })
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

type Request = SdkRequest<"notification-policies-create-a-notification-policy">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a Notification policy",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "alerting policies create",
				classification: {
					safeFlags: ["alert-type", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf alerting policies create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/alerting/v3/policies`,
						pathParams: {},
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
											traffic_exclusions: argv["filters-traffic-exclusions"],
											tunnel_id: argv["filters-tunnel-id"],
											tunnel_name: argv["filters-tunnel-name"],
											type: argv["filters-type"],
											where: argv["filters-where"],
											zones: argv["filters-zones"],
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.alerting.policies.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["alert-type"] === undefined) {
					argv["alert-type"] = await promptForRequiredEnumField(
						"alert-type",
						"Refers to which event will trigger a Notification dispatch. You can use the endpoint to get available alert types which then will give you a list of possible values.",
						[
							"abuse_report_alert",
							"access_custom_certificate_expiration_type",
							"advanced_ddos_attack_l4_alert",
							"advanced_ddos_attack_l7_alert",
							"advanced_http_alert_error",
							"bgp_hijack_notification",
							"billing_usage_alert",
							"block_notification_block_removed",
							"block_notification_new_block",
							"block_notification_review_rejected",
							"bot_traffic_basic_alert",
							"brand_protection_alert",
							"brand_protection_digest",
							"clickhouse_alert_fw_anomaly",
							"clickhouse_alert_fw_ent_anomaly",
							"cloudforce_one_request_notification",
							"cni_maintenance_notification",
							"custom_analytics",
							"custom_bot_detection_alert",
							"custom_ssl_certificate_event_type",
							"dedicated_ssl_certificate_event_type",
							"device_connectivity_anomaly_alert",
							"dos_attack_l4",
							"dos_attack_l7",
							"expiring_service_token_alert",
							"failing_logpush_job_disabled_alert",
							"fbm_auto_advertisement",
							"fbm_dosd_attack",
							"fbm_volumetric_attack",
							"health_check_status_notification",
							"hostname_aop_custom_certificate_expiration_type",
							"http_alert_edge_error",
							"http_alert_origin_error",
							"image_notification",
							"image_resizing_notification",
							"incident_alert",
							"load_balancing_health_alert",
							"load_balancing_pool_enablement_alert",
							"logo_match_alert",
							"magic_tunnel_health_check_event",
							"magic_wan_tunnel_health",
							"maintenance_event_notification",
							"mtls_certificate_store_certificate_expiration_type",
							"pages_event_alert",
							"radar_notification",
							"real_origin_monitoring",
							"scriptmonitor_alert_new_code_change_detections",
							"scriptmonitor_alert_new_hosts",
							"scriptmonitor_alert_new_malicious_hosts",
							"scriptmonitor_alert_new_malicious_scripts",
							"scriptmonitor_alert_new_malicious_url",
							"scriptmonitor_alert_new_max_length_resource_url",
							"scriptmonitor_alert_new_resources",
							"secondary_dns_all_primaries_failing",
							"secondary_dns_primaries_failing",
							"secondary_dns_warning",
							"secondary_dns_zone_successfully_updated",
							"secondary_dns_zone_validation_warning",
							"security_insights_alert",
							"sentinel_alert",
							"stream_live_notifications",
							"synthetic_test_latency_alert",
							"synthetic_test_low_availability_alert",
							"traffic_anomalies_alert",
							"tunnel_health_event",
							"tunnel_update_event",
							"universal_ssl_event_type",
							"web_analytics_metrics_update",
							"zone_aop_custom_certificate_expiration_type",
						] as const
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the policy."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						traffic_exclusions: argv["filters-traffic-exclusions"],
						tunnel_id: argv["filters-tunnel-id"],
						tunnel_name: argv["filters-tunnel-name"],
						type: argv["filters-type"],
						where: argv["filters-where"],
						zones: argv["filters-zones"],
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.alerting.policies.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
