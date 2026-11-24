import operation from "../../_operations/alerting/policies/create.js";
/**
 * create command
 * @generated from apis/overlays/alerting.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a Notification policy",
	usage: "$0 alerting policies create\n\nCreates a new Notification policy.",
	flags: {
		"alert-interval": {
			kind: "parsed",
			brief:
				"Optional specification of how often to re-alert from the same incident, not support on all alert types.",
			optional: true,
			parse: String,
		},
		"alert-type": {
			kind: "parsed",
			brief:
				"Refers to which event will trigger a Notification dispatch. You can use the endpoint to get available alert types which then will give you a list of possible values. This enum lists every alert type, not the ones a given account can create, since some types depend on entitlements or account type. To get the alert types an account can create, call `GET /accounts/{account_id}/alerting/v3/available_alerts`.",
			optional: true,
			choices: [
				"abuse_report_alert",
				"access_custom_certificate_expiration_type",
				"advanced_ddos_attack_l4_alert",
				"advanced_ddos_attack_l7_alert",
				"advanced_http_alert_error",
				"attack_lifecycle",
				"bgp_advertisement_change",
				"bgp_hijack_notification",
				"billing_budget_alert",
				"billing_usage_alert",
				"block_notification_block_removed",
				"block_notification_new_block",
				"block_notification_review_rejected",
				"bot_traffic_basic_alert",
				"brand_protection_alert",
				"brand_protection_digest",
				"casb_weekly_digest",
				"clickhouse_alert_fw_anomaly",
				"clickhouse_alert_fw_ent_anomaly",
				"closed_port_scan_alert",
				"cloudforce_one_request_notification",
				"cmd_managed_defense_notification",
				"cni_maintenance_notification",
				"containers_security_alert",
				"custom_analytics",
				"custom_bot_detection_alert",
				"custom_ssl_certificate_event_type",
				"dedicated_ssl_certificate_event_type",
				"device_connectivity_anomaly_alert",
				"dex_device_connectivity_alert",
				"dex_synthetic_test_availability_alert",
				"dex_synthetic_test_latency_alert",
				"dos_attack_l4",
				"dos_attack_l7",
				"executive_communications",
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
				"leaked_service_token_alert",
				"load_balancing_health_alert",
				"load_balancing_pool_enablement_alert",
				"log_explorer_ingest_rate_limit",
				"log_explorer_scheduled_query_results_alert",
				"logo_match_alert",
				"magic_endpoint_healthcheck_alert",
				"magic_tunnel_health_check_event",
				"magic_wan_tunnel_health",
				"maintenance_event_notification",
				"mtls_certificate_store_certificate_expiration_type",
				"open_port_scan_alert",
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
				"stakeout_credential_leak_alert",
				"stakeout_saved_query_daily_digest_alert",
				"stakeout_saved_query_immediate_alert",
				"stream_live_notifications",
				"synthetic_test_latency_alert",
				"synthetic_test_low_availability_alert",
				"traffic_anomalies_alert",
				"tunnel_health_event",
				"tunnel_update_event",
				"universal_ssl_event_type",
				"web_analytics_metrics_update",
				"workers_for_platforms_security_alert",
				"workers_observability_alert",
				"workers_observability_real_time_issue",
				"zone_aop_custom_certificate_expiration_type",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "alert-type", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Optional description for the Notification policy.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether or not the Notification policy is enabled.",
			default: true,
		},
		"filters-actions": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-affected-asns": {
			kind: "parsed",
			brief: "Used for configuring radar_notification",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-affected-components": {
			kind: "parsed",
			brief: "Used for configuring incident_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-affected-locations": {
			kind: "parsed",
			brief: "Used for configuring radar_notification",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-airport-code": {
			kind: "parsed",
			brief: "Used for configuring maintenance_event_notification",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-alert-trigger-preferences": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-alert-trigger-preferences-value": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-check-id": {
			kind: "parsed",
			brief:
				"Used for configuring magic_endpoint_healthcheck_alert. Takes one or more health check IDs, each a UUID. That alert type requires check_id together with alert_trigger_preferences set to slo, a numeric alert_trigger_preferences_value, and selectors set to failures.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-enabled": {
			kind: "parsed",
			brief: "Used for configuring load_balancing_pool_enablement_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-environment": {
			kind: "parsed",
			brief: "Used for configuring pages_event_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-event": {
			kind: "parsed",
			brief: "Used for configuring pages_event_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-event-source": {
			kind: "parsed",
			brief: "Used for configuring load_balancing_health_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-event-type": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-group-by": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-health-check-id": {
			kind: "parsed",
			brief: "Used for configuring health_check_status_notification",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-incident-impact": {
			kind: "parsed",
			brief: "Used for configuring incident_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-input-id": {
			kind: "parsed",
			brief: "Used for configuring stream_live_notifications",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-insight-class": {
			kind: "parsed",
			brief: "Used for configuring security_insights_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-limit": {
			kind: "parsed",
			brief: "Used for configuring billing_usage_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-logo-tag": {
			kind: "parsed",
			brief: "Used for configuring logo_match_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-megabits-per-second": {
			kind: "parsed",
			brief: "Used for configuring advanced_ddos_attack_l4_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-new-health": {
			kind: "parsed",
			brief: "Used for configuring load_balancing_health_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-new-status": {
			kind: "parsed",
			brief: "Used for configuring tunnel_health_event",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-packets-per-second": {
			kind: "parsed",
			brief: "Used for configuring advanced_ddos_attack_l4_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-pool-id": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-pop-names": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-product": {
			kind: "parsed",
			brief: "Used for configuring billing_usage_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-project-id": {
			kind: "parsed",
			brief: "Used for configuring pages_event_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-protocol": {
			kind: "parsed",
			brief: "Used for configuring advanced_ddos_attack_l4_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-query-id": {
			kind: "parsed",
			brief:
				"Used for configuring stakeout_saved_query_daily_digest_alert and stakeout_saved_query_immediate_alert, which require it. Takes exactly one value, the saved query ID.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-query-tag": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-requests-per-second": {
			kind: "parsed",
			brief: "Used for configuring advanced_ddos_attack_l7_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-selectors": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-services": {
			kind: "parsed",
			brief: "Used for configuring clickhouse_alert_fw_ent_anomaly",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-slo": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-status": {
			kind: "parsed",
			brief: "Used for configuring health_check_status_notification",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-target-hostname": {
			kind: "parsed",
			brief: "Used for configuring advanced_ddos_attack_l7_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-target-ip": {
			kind: "parsed",
			brief: "Used for configuring advanced_ddos_attack_l4_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-target-zone-name": {
			kind: "parsed",
			brief: "Used for configuring advanced_ddos_attack_l7_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-token-id": {
			kind: "parsed",
			brief:
				"Access service token IDs to include for expiring_service_token_alert. Omit this property to include all current and future service tokens.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-total-spend-dollars": {
			kind: "parsed",
			brief:
				"Used for configuring billing_budget_alert. Takes exactly one value, the budget threshold in US dollars, as a string greater than zero.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-traffic-exclusions": {
			kind: "parsed",
			brief: "Used for configuring traffic_anomalies_alert",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-tunnel-id": {
			kind: "parsed",
			brief: "Used for configuring tunnel_health_event",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-tunnel-name": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-type": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-where": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"filters-zones": {
			kind: "parsed",
			brief: "Usage depends on specific alert type",
			variadic: true,
			optional: true,
			parse: String,
		},
		"mechanisms-email": {
			kind: "parsed",
			brief:
				'The mechanisms.email field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"mechanisms-pagerduty": {
			kind: "parsed",
			brief:
				'The mechanisms.pagerduty field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"mechanisms-webhooks": {
			kind: "parsed",
			brief:
				'The mechanisms.webhooks field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the policy.",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "alerting policies create",
				classification: {
					safeFlags: ["alert-type", "enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["alert-type"] === undefined) {
						argv["alert-type"] = await promptForRequiredEnumField(
							"alert-type",
							"Refers to which event will trigger a Notification dispatch. You can use the endpoint to get available alert types which then will give you a list of possible values. This enum lists every alert type, not the ones a given account can create, since some types depend on entitlements or account type. To get the alert types an account can create, call \`GET /accounts/{account_id}/alerting/v3/available_alerts\`.",
							[
								"abuse_report_alert",
								"access_custom_certificate_expiration_type",
								"advanced_ddos_attack_l4_alert",
								"advanced_ddos_attack_l7_alert",
								"advanced_http_alert_error",
								"attack_lifecycle",
								"bgp_advertisement_change",
								"bgp_hijack_notification",
								"billing_budget_alert",
								"billing_usage_alert",
								"block_notification_block_removed",
								"block_notification_new_block",
								"block_notification_review_rejected",
								"bot_traffic_basic_alert",
								"brand_protection_alert",
								"brand_protection_digest",
								"casb_weekly_digest",
								"clickhouse_alert_fw_anomaly",
								"clickhouse_alert_fw_ent_anomaly",
								"closed_port_scan_alert",
								"cloudforce_one_request_notification",
								"cmd_managed_defense_notification",
								"cni_maintenance_notification",
								"containers_security_alert",
								"custom_analytics",
								"custom_bot_detection_alert",
								"custom_ssl_certificate_event_type",
								"dedicated_ssl_certificate_event_type",
								"device_connectivity_anomaly_alert",
								"dex_device_connectivity_alert",
								"dex_synthetic_test_availability_alert",
								"dex_synthetic_test_latency_alert",
								"dos_attack_l4",
								"dos_attack_l7",
								"executive_communications",
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
								"leaked_service_token_alert",
								"load_balancing_health_alert",
								"load_balancing_pool_enablement_alert",
								"log_explorer_ingest_rate_limit",
								"log_explorer_scheduled_query_results_alert",
								"logo_match_alert",
								"magic_endpoint_healthcheck_alert",
								"magic_tunnel_health_check_event",
								"magic_wan_tunnel_health",
								"maintenance_event_notification",
								"mtls_certificate_store_certificate_expiration_type",
								"open_port_scan_alert",
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
								"stakeout_credential_leak_alert",
								"stakeout_saved_query_daily_digest_alert",
								"stakeout_saved_query_immediate_alert",
								"stream_live_notifications",
								"synthetic_test_latency_alert",
								"synthetic_test_low_availability_alert",
								"traffic_anomalies_alert",
								"tunnel_health_event",
								"tunnel_update_event",
								"universal_ssl_event_type",
								"web_analytics_metrics_update",
								"workers_for_platforms_security_alert",
								"workers_observability_alert",
								"workers_observability_real_time_issue",
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

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
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
