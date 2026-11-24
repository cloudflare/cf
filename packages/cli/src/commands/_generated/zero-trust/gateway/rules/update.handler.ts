import operation from "../../../_operations/zero-trust/gateway/rules/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust gateway rules update",
			classification: {
				safeFlags: [
					"action",
					"enabled",
					"rule-settings-allow-child-bypass",
					"rule-settings-biso-admin-controls-copy",
					"rule-settings-biso-admin-controls-dcp",
					"rule-settings-biso-admin-controls-dd",
					"rule-settings-biso-admin-controls-dk",
					"rule-settings-biso-admin-controls-download",
					"rule-settings-biso-admin-controls-dp",
					"rule-settings-biso-admin-controls-du",
					"rule-settings-biso-admin-controls-keyboard",
					"rule-settings-biso-admin-controls-paste",
					"rule-settings-biso-admin-controls-printing",
					"rule-settings-biso-admin-controls-upload",
					"rule-settings-biso-admin-controls-version",
					"rule-settings-block-page-include-context",
					"rule-settings-block-page-enabled",
					"rule-settings-bypass-parent-rule",
					"rule-settings-check-session-enforce",
					"rule-settings-forensic-copy-enabled",
					"rule-settings-ignore-cname-category-matches",
					"rule-settings-insecure-disable-dnssec-validation",
					"rule-settings-ip-categories",
					"rule-settings-ip-indicator-feeds",
					"rule-settings-notification-settings-enabled",
					"rule-settings-notification-settings-include-context",
					"rule-settings-payload-log-enabled",
					"rule-settings-redirect-include-context",
					"rule-settings-redirect-preserve-path-and-query",
					"rule-settings-resolve-dns-internally-fallback",
					"rule-settings-resolve-dns-through-cloudflare",
					"rule-settings-untrusted-cert-action",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"Specify the action to perform when the associated traffic, identity, and device posture expressions either absent or evaluate to \`true\`.",
						[
							"on",
							"off",
							"allow",
							"block",
							"scan",
							"noscan",
							"safesearch",
							"ytrestricted",
							"isolate",
							"noisolate",
							"override",
							"l4_override",
							"egress",
							"resolve",
							"quarantine",
							"redirect",
							"forward",
						] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Specify the rule name."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust gateway rules update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
					pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										action: argv["action"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										device_posture: resolveFileToken(
											argv["device-posture"] as string | undefined,
											"device-posture",
											"text"
										),
										enabled: argv["enabled"],
										expiration: {
											duration: argv["expiration-duration"],
											expires_at: resolveFileToken(
												argv["expiration-expires-at"] as string | undefined,
												"expiration-expires-at",
												"text"
											),
										},
										filters: argv["filters"],
										identity: resolveFileToken(
											argv["identity"] as string | undefined,
											"identity",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										precedence: argv["precedence"],
										rule_settings: {
											add_headers: parseJsonMap(
												argv["rule-settings-add-headers"],
												"rule-settings-add-headers"
											),
											allow_child_bypass:
												argv["rule-settings-allow-child-bypass"],
											biso_admin_controls: {
												copy: argv["rule-settings-biso-admin-controls-copy"],
												dcp: argv["rule-settings-biso-admin-controls-dcp"],
												dd: argv["rule-settings-biso-admin-controls-dd"],
												dk: argv["rule-settings-biso-admin-controls-dk"],
												download:
													argv["rule-settings-biso-admin-controls-download"],
												dp: argv["rule-settings-biso-admin-controls-dp"],
												du: argv["rule-settings-biso-admin-controls-du"],
												keyboard:
													argv["rule-settings-biso-admin-controls-keyboard"],
												paste: argv["rule-settings-biso-admin-controls-paste"],
												printing:
													argv["rule-settings-biso-admin-controls-printing"],
												upload:
													argv["rule-settings-biso-admin-controls-upload"],
												version:
													argv["rule-settings-biso-admin-controls-version"],
												wm_id: resolveFileToken(
													argv["rule-settings-biso-admin-controls-wm-id"] as
														| string
														| undefined,
													"rule-settings-biso-admin-controls-wm-id",
													"text"
												),
											},
											block_page: {
												include_context:
													argv["rule-settings-block-page-include-context"],
												target_uri: resolveFileToken(
													argv["rule-settings-block-page-target-uri"] as
														| string
														| undefined,
													"rule-settings-block-page-target-uri",
													"text"
												),
											},
											block_page_enabled:
												argv["rule-settings-block-page-enabled"],
											block_reason: resolveFileToken(
												argv["rule-settings-block-reason"] as
													| string
													| undefined,
												"rule-settings-block-reason",
												"text"
											),
											bypass_parent_rule:
												argv["rule-settings-bypass-parent-rule"],
											check_session: {
												duration: resolveFileToken(
													argv["rule-settings-check-session-duration"] as
														| string
														| undefined,
													"rule-settings-check-session-duration",
													"text"
												),
												enforce: argv["rule-settings-check-session-enforce"],
											},
											delete_headers: argv["rule-settings-delete-headers"],
											dns_resolvers: {
												ipv4: parseObjectArray(
													argv["rule-settings-dns-resolvers-ipv4"],
													"rule-settings-dns-resolvers-ipv4"
												),
												ipv6: parseObjectArray(
													argv["rule-settings-dns-resolvers-ipv6"],
													"rule-settings-dns-resolvers-ipv6"
												),
											},
											egress: {
												ipv4: resolveFileToken(
													argv["rule-settings-egress-ipv4"] as
														| string
														| undefined,
													"rule-settings-egress-ipv4",
													"text"
												),
												ipv4_fallback: resolveFileToken(
													argv["rule-settings-egress-ipv4-fallback"] as
														| string
														| undefined,
													"rule-settings-egress-ipv4-fallback",
													"text"
												),
												ipv6: resolveFileToken(
													argv["rule-settings-egress-ipv6"] as
														| string
														| undefined,
													"rule-settings-egress-ipv6",
													"text"
												),
											},
											forensic_copy: {
												enabled: argv["rule-settings-forensic-copy-enabled"],
											},
											forward: {
												worker_id: resolveFileToken(
													argv["rule-settings-forward-worker-id"] as
														| string
														| undefined,
													"rule-settings-forward-worker-id",
													"text"
												),
											},
											ignore_cname_category_matches:
												argv["rule-settings-ignore-cname-category-matches"],
											insecure_disable_dnssec_validation:
												argv[
													"rule-settings-insecure-disable-dnssec-validation"
												],
											ip_categories: argv["rule-settings-ip-categories"],
											ip_indicator_feeds:
												argv["rule-settings-ip-indicator-feeds"],
											l4override: {
												ip: resolveFileToken(
													argv["rule-settings-l4override-ip"] as
														| string
														| undefined,
													"rule-settings-l4override-ip",
													"text"
												),
												port: argv["rule-settings-l4override-port"],
											},
											notification_settings: {
												enabled:
													argv["rule-settings-notification-settings-enabled"],
												include_context:
													argv[
														"rule-settings-notification-settings-include-context"
													],
												msg: resolveFileToken(
													argv["rule-settings-notification-settings-msg"] as
														| string
														| undefined,
													"rule-settings-notification-settings-msg",
													"text"
												),
												support_url: resolveFileToken(
													argv[
														"rule-settings-notification-settings-support-url"
													] as string | undefined,
													"rule-settings-notification-settings-support-url",
													"text"
												),
											},
											override_host: resolveFileToken(
												argv["rule-settings-override-host"] as
													| string
													| undefined,
												"rule-settings-override-host",
												"text"
											),
											override_ips: argv["rule-settings-override-ips"],
											payload_log: {
												enabled: argv["rule-settings-payload-log-enabled"],
											},
											quarantine: {
												file_types: argv["rule-settings-quarantine-file-types"],
											},
											redirect: {
												include_context:
													argv["rule-settings-redirect-include-context"],
												preserve_path_and_query:
													argv[
														"rule-settings-redirect-preserve-path-and-query"
													],
												target_uri: resolveFileToken(
													argv["rule-settings-redirect-target-uri"] as
														| string
														| undefined,
													"rule-settings-redirect-target-uri",
													"text"
												),
											},
											resolve_dns_internally: {
												fallback:
													argv["rule-settings-resolve-dns-internally-fallback"],
												view_id: resolveFileToken(
													argv[
														"rule-settings-resolve-dns-internally-view-id"
													] as string | undefined,
													"rule-settings-resolve-dns-internally-view-id",
													"text"
												),
											},
											resolve_dns_through_cloudflare:
												argv["rule-settings-resolve-dns-through-cloudflare"],
											set_headers: parseJsonMap(
												argv["rule-settings-set-headers"],
												"rule-settings-set-headers"
											),
											untrusted_cert: {
												action: argv["rule-settings-untrusted-cert-action"],
											},
										},
										schedule: {
											fri: resolveFileToken(
												argv["schedule-fri"] as string | undefined,
												"schedule-fri",
												"text"
											),
											mon: resolveFileToken(
												argv["schedule-mon"] as string | undefined,
												"schedule-mon",
												"text"
											),
											sat: resolveFileToken(
												argv["schedule-sat"] as string | undefined,
												"schedule-sat",
												"text"
											),
											sun: resolveFileToken(
												argv["schedule-sun"] as string | undefined,
												"schedule-sun",
												"text"
											),
											thu: resolveFileToken(
												argv["schedule-thu"] as string | undefined,
												"schedule-thu",
												"text"
											),
											time_zone: resolveFileToken(
												argv["schedule-time-zone"] as string | undefined,
												"schedule-time-zone",
												"text"
											),
											tue: resolveFileToken(
												argv["schedule-tue"] as string | undefined,
												"schedule-tue",
												"text"
											),
											wed: resolveFileToken(
												argv["schedule-wed"] as string | undefined,
												"schedule-wed",
												"text"
											),
										},
										traffic: resolveFileToken(
											argv["traffic"] as string | undefined,
											"traffic",
											"text"
										),
									},
									[
										["rule_settings", "add_headers"],
										["rule_settings", "set_headers"],
									]
								),
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
						rule_id: argv["rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					action: argv["action"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					device_posture: resolveFileToken(
						argv["device-posture"] as string | undefined,
						"device-posture",
						"text"
					),
					enabled: argv["enabled"],
					expiration: {
						duration: argv["expiration-duration"],
						expires_at: resolveFileToken(
							argv["expiration-expires-at"] as string | undefined,
							"expiration-expires-at",
							"text"
						),
					},
					filters: argv["filters"],
					identity: resolveFileToken(
						argv["identity"] as string | undefined,
						"identity",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					precedence: argv["precedence"],
					rule_settings: {
						add_headers: parseJsonMap(
							argv["rule-settings-add-headers"],
							"rule-settings-add-headers"
						),
						allow_child_bypass: argv["rule-settings-allow-child-bypass"],
						biso_admin_controls: {
							copy: argv["rule-settings-biso-admin-controls-copy"],
							dcp: argv["rule-settings-biso-admin-controls-dcp"],
							dd: argv["rule-settings-biso-admin-controls-dd"],
							dk: argv["rule-settings-biso-admin-controls-dk"],
							download: argv["rule-settings-biso-admin-controls-download"],
							dp: argv["rule-settings-biso-admin-controls-dp"],
							du: argv["rule-settings-biso-admin-controls-du"],
							keyboard: argv["rule-settings-biso-admin-controls-keyboard"],
							paste: argv["rule-settings-biso-admin-controls-paste"],
							printing: argv["rule-settings-biso-admin-controls-printing"],
							upload: argv["rule-settings-biso-admin-controls-upload"],
							version: argv["rule-settings-biso-admin-controls-version"],
							wm_id: resolveFileToken(
								argv["rule-settings-biso-admin-controls-wm-id"] as
									| string
									| undefined,
								"rule-settings-biso-admin-controls-wm-id",
								"text"
							),
						},
						block_page: {
							include_context: argv["rule-settings-block-page-include-context"],
							target_uri: resolveFileToken(
								argv["rule-settings-block-page-target-uri"] as
									| string
									| undefined,
								"rule-settings-block-page-target-uri",
								"text"
							),
						},
						block_page_enabled: argv["rule-settings-block-page-enabled"],
						block_reason: resolveFileToken(
							argv["rule-settings-block-reason"] as string | undefined,
							"rule-settings-block-reason",
							"text"
						),
						bypass_parent_rule: argv["rule-settings-bypass-parent-rule"],
						check_session: {
							duration: resolveFileToken(
								argv["rule-settings-check-session-duration"] as
									| string
									| undefined,
								"rule-settings-check-session-duration",
								"text"
							),
							enforce: argv["rule-settings-check-session-enforce"],
						},
						delete_headers: argv["rule-settings-delete-headers"],
						dns_resolvers: {
							ipv4: parseObjectArray(
								argv["rule-settings-dns-resolvers-ipv4"],
								"rule-settings-dns-resolvers-ipv4"
							),
							ipv6: parseObjectArray(
								argv["rule-settings-dns-resolvers-ipv6"],
								"rule-settings-dns-resolvers-ipv6"
							),
						},
						egress: {
							ipv4: resolveFileToken(
								argv["rule-settings-egress-ipv4"] as string | undefined,
								"rule-settings-egress-ipv4",
								"text"
							),
							ipv4_fallback: resolveFileToken(
								argv["rule-settings-egress-ipv4-fallback"] as
									| string
									| undefined,
								"rule-settings-egress-ipv4-fallback",
								"text"
							),
							ipv6: resolveFileToken(
								argv["rule-settings-egress-ipv6"] as string | undefined,
								"rule-settings-egress-ipv6",
								"text"
							),
						},
						forensic_copy: {
							enabled: argv["rule-settings-forensic-copy-enabled"],
						},
						forward: {
							worker_id: resolveFileToken(
								argv["rule-settings-forward-worker-id"] as string | undefined,
								"rule-settings-forward-worker-id",
								"text"
							),
						},
						ignore_cname_category_matches:
							argv["rule-settings-ignore-cname-category-matches"],
						insecure_disable_dnssec_validation:
							argv["rule-settings-insecure-disable-dnssec-validation"],
						ip_categories: argv["rule-settings-ip-categories"],
						ip_indicator_feeds: argv["rule-settings-ip-indicator-feeds"],
						l4override: {
							ip: resolveFileToken(
								argv["rule-settings-l4override-ip"] as string | undefined,
								"rule-settings-l4override-ip",
								"text"
							),
							port: argv["rule-settings-l4override-port"],
						},
						notification_settings: {
							enabled: argv["rule-settings-notification-settings-enabled"],
							include_context:
								argv["rule-settings-notification-settings-include-context"],
							msg: resolveFileToken(
								argv["rule-settings-notification-settings-msg"] as
									| string
									| undefined,
								"rule-settings-notification-settings-msg",
								"text"
							),
							support_url: resolveFileToken(
								argv["rule-settings-notification-settings-support-url"] as
									| string
									| undefined,
								"rule-settings-notification-settings-support-url",
								"text"
							),
						},
						override_host: resolveFileToken(
							argv["rule-settings-override-host"] as string | undefined,
							"rule-settings-override-host",
							"text"
						),
						override_ips: argv["rule-settings-override-ips"],
						payload_log: {
							enabled: argv["rule-settings-payload-log-enabled"],
						},
						quarantine: {
							file_types: argv["rule-settings-quarantine-file-types"],
						},
						redirect: {
							include_context: argv["rule-settings-redirect-include-context"],
							preserve_path_and_query:
								argv["rule-settings-redirect-preserve-path-and-query"],
							target_uri: resolveFileToken(
								argv["rule-settings-redirect-target-uri"] as string | undefined,
								"rule-settings-redirect-target-uri",
								"text"
							),
						},
						resolve_dns_internally: {
							fallback: argv["rule-settings-resolve-dns-internally-fallback"],
							view_id: resolveFileToken(
								argv["rule-settings-resolve-dns-internally-view-id"] as
									| string
									| undefined,
								"rule-settings-resolve-dns-internally-view-id",
								"text"
							),
						},
						resolve_dns_through_cloudflare:
							argv["rule-settings-resolve-dns-through-cloudflare"],
						set_headers: parseJsonMap(
							argv["rule-settings-set-headers"],
							"rule-settings-set-headers"
						),
						untrusted_cert: {
							action: argv["rule-settings-untrusted-cert-action"],
						},
					},
					schedule: {
						fri: resolveFileToken(
							argv["schedule-fri"] as string | undefined,
							"schedule-fri",
							"text"
						),
						mon: resolveFileToken(
							argv["schedule-mon"] as string | undefined,
							"schedule-mon",
							"text"
						),
						sat: resolveFileToken(
							argv["schedule-sat"] as string | undefined,
							"schedule-sat",
							"text"
						),
						sun: resolveFileToken(
							argv["schedule-sun"] as string | undefined,
							"schedule-sun",
							"text"
						),
						thu: resolveFileToken(
							argv["schedule-thu"] as string | undefined,
							"schedule-thu",
							"text"
						),
						time_zone: resolveFileToken(
							argv["schedule-time-zone"] as string | undefined,
							"schedule-time-zone",
							"text"
						),
						tue: resolveFileToken(
							argv["schedule-tue"] as string | undefined,
							"schedule-tue",
							"text"
						),
						wed: resolveFileToken(
							argv["schedule-wed"] as string | undefined,
							"schedule-wed",
							"text"
						),
					},
					traffic: resolveFileToken(
						argv["traffic"] as string | undefined,
						"traffic",
						"text"
					),
				},
				[
					["rule_settings", "add_headers"],
					["rule_settings", "set_headers"],
				]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					rule_id: argv["rule-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
