import operation from "../../../_operations/zero-trust/gateway/configurations/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust gateway configurations update",
			classification: {
				safeFlags: [
					"settings-activity-log-enabled",
					"settings-antivirus-enabled-download-phase",
					"settings-antivirus-enabled-upload-phase",
					"settings-antivirus-fail-closed",
					"settings-antivirus-notification-settings-enabled",
					"settings-antivirus-notification-settings-include-context",
					"settings-block-page-enabled",
					"settings-block-page-include-context",
					"settings-block-page-mode",
					"settings-block-page-suppress-footer",
					"settings-body-scanning-inspection-mode",
					"settings-browser-isolation-non-identity-enabled",
					"settings-browser-isolation-url-browser-isolation-enabled",
					"settings-custom-certificate-enabled",
					"settings-extended-email-matching-enabled",
					"settings-fips-tls",
					"settings-host-selector-enabled",
					"settings-inspection-mode",
					"settings-protocol-detection-enabled",
					"settings-sandbox-enabled",
					"settings-sandbox-fallback-action",
					"settings-tls-decrypt-enabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust gateway configurations update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/configuration`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										settings: {
											activity_log: {
												enabled: argv["settings-activity-log-enabled"],
											},
											antivirus: {
												enabled_download_phase:
													argv["settings-antivirus-enabled-download-phase"],
												enabled_upload_phase:
													argv["settings-antivirus-enabled-upload-phase"],
												fail_closed: argv["settings-antivirus-fail-closed"],
												notification_settings: {
													enabled:
														argv[
															"settings-antivirus-notification-settings-enabled"
														],
													include_context:
														argv[
															"settings-antivirus-notification-settings-include-context"
														],
													msg: resolveFileToken(
														argv[
															"settings-antivirus-notification-settings-msg"
														] as string | undefined,
														"settings-antivirus-notification-settings-msg",
														"text"
													),
													support_url: resolveFileToken(
														argv[
															"settings-antivirus-notification-settings-support-url"
														] as string | undefined,
														"settings-antivirus-notification-settings-support-url",
														"text"
													),
												},
											},
											block_page: {
												background_color: resolveFileToken(
													argv["settings-block-page-background-color"] as
														| string
														| undefined,
													"settings-block-page-background-color",
													"text"
												),
												enabled: argv["settings-block-page-enabled"],
												footer_text: resolveFileToken(
													argv["settings-block-page-footer-text"] as
														| string
														| undefined,
													"settings-block-page-footer-text",
													"text"
												),
												header_text: resolveFileToken(
													argv["settings-block-page-header-text"] as
														| string
														| undefined,
													"settings-block-page-header-text",
													"text"
												),
												include_context:
													argv["settings-block-page-include-context"],
												logo_path: resolveFileToken(
													argv["settings-block-page-logo-path"] as
														| string
														| undefined,
													"settings-block-page-logo-path",
													"text"
												),
												mailto_address: resolveFileToken(
													argv["settings-block-page-mailto-address"] as
														| string
														| undefined,
													"settings-block-page-mailto-address",
													"text"
												),
												mailto_subject: resolveFileToken(
													argv["settings-block-page-mailto-subject"] as
														| string
														| undefined,
													"settings-block-page-mailto-subject",
													"text"
												),
												mode: argv["settings-block-page-mode"],
												name: resolveFileToken(
													argv["settings-block-page-name"] as
														| string
														| undefined,
													"settings-block-page-name",
													"text"
												),
												suppress_footer:
													argv["settings-block-page-suppress-footer"],
												target_uri: resolveFileToken(
													argv["settings-block-page-target-uri"] as
														| string
														| undefined,
													"settings-block-page-target-uri",
													"text"
												),
											},
											body_scanning: {
												inspection_mode:
													argv["settings-body-scanning-inspection-mode"],
											},
											browser_isolation: {
												non_identity_enabled:
													argv[
														"settings-browser-isolation-non-identity-enabled"
													],
												url_browser_isolation_enabled:
													argv[
														"settings-browser-isolation-url-browser-isolation-enabled"
													],
											},
											certificate: {
												id: resolveFileToken(
													argv["settings-certificate-id"] as string | undefined,
													"settings-certificate-id",
													"text"
												),
											},
											custom_certificate: {
												enabled: argv["settings-custom-certificate-enabled"],
												id: resolveFileToken(
													argv["settings-custom-certificate-id"] as
														| string
														| undefined,
													"settings-custom-certificate-id",
													"text"
												),
											},
											extended_email_matching: {
												enabled:
													argv["settings-extended-email-matching-enabled"],
											},
											fips: {
												tls: argv["settings-fips-tls"],
											},
											host_selector: {
												enabled: argv["settings-host-selector-enabled"],
											},
											inspection: {
												mode: argv["settings-inspection-mode"],
											},
											max_ttl_secs: argv["settings-max-ttl-secs"],
											protocol_detection: {
												enabled: argv["settings-protocol-detection-enabled"],
											},
											regions: parseJsonMap(
												argv["settings-regions"],
												"settings-regions"
											),
											sandbox: {
												enabled: argv["settings-sandbox-enabled"],
												fallback_action:
													argv["settings-sandbox-fallback-action"],
											},
											tls_decrypt: {
												enabled: argv["settings-tls-decrypt-enabled"],
											},
										},
									},
									[["settings", "regions"]]
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					settings: {
						activity_log: {
							enabled: argv["settings-activity-log-enabled"],
						},
						antivirus: {
							enabled_download_phase:
								argv["settings-antivirus-enabled-download-phase"],
							enabled_upload_phase:
								argv["settings-antivirus-enabled-upload-phase"],
							fail_closed: argv["settings-antivirus-fail-closed"],
							notification_settings: {
								enabled:
									argv["settings-antivirus-notification-settings-enabled"],
								include_context:
									argv[
										"settings-antivirus-notification-settings-include-context"
									],
								msg: resolveFileToken(
									argv["settings-antivirus-notification-settings-msg"] as
										| string
										| undefined,
									"settings-antivirus-notification-settings-msg",
									"text"
								),
								support_url: resolveFileToken(
									argv[
										"settings-antivirus-notification-settings-support-url"
									] as string | undefined,
									"settings-antivirus-notification-settings-support-url",
									"text"
								),
							},
						},
						block_page: {
							background_color: resolveFileToken(
								argv["settings-block-page-background-color"] as
									| string
									| undefined,
								"settings-block-page-background-color",
								"text"
							),
							enabled: argv["settings-block-page-enabled"],
							footer_text: resolveFileToken(
								argv["settings-block-page-footer-text"] as string | undefined,
								"settings-block-page-footer-text",
								"text"
							),
							header_text: resolveFileToken(
								argv["settings-block-page-header-text"] as string | undefined,
								"settings-block-page-header-text",
								"text"
							),
							include_context: argv["settings-block-page-include-context"],
							logo_path: resolveFileToken(
								argv["settings-block-page-logo-path"] as string | undefined,
								"settings-block-page-logo-path",
								"text"
							),
							mailto_address: resolveFileToken(
								argv["settings-block-page-mailto-address"] as
									| string
									| undefined,
								"settings-block-page-mailto-address",
								"text"
							),
							mailto_subject: resolveFileToken(
								argv["settings-block-page-mailto-subject"] as
									| string
									| undefined,
								"settings-block-page-mailto-subject",
								"text"
							),
							mode: argv["settings-block-page-mode"],
							name: resolveFileToken(
								argv["settings-block-page-name"] as string | undefined,
								"settings-block-page-name",
								"text"
							),
							suppress_footer: argv["settings-block-page-suppress-footer"],
							target_uri: resolveFileToken(
								argv["settings-block-page-target-uri"] as string | undefined,
								"settings-block-page-target-uri",
								"text"
							),
						},
						body_scanning: {
							inspection_mode: argv["settings-body-scanning-inspection-mode"],
						},
						browser_isolation: {
							non_identity_enabled:
								argv["settings-browser-isolation-non-identity-enabled"],
							url_browser_isolation_enabled:
								argv[
									"settings-browser-isolation-url-browser-isolation-enabled"
								],
						},
						certificate: {
							id: resolveFileToken(
								argv["settings-certificate-id"] as string | undefined,
								"settings-certificate-id",
								"text"
							),
						},
						custom_certificate: {
							enabled: argv["settings-custom-certificate-enabled"],
							id: resolveFileToken(
								argv["settings-custom-certificate-id"] as string | undefined,
								"settings-custom-certificate-id",
								"text"
							),
						},
						extended_email_matching: {
							enabled: argv["settings-extended-email-matching-enabled"],
						},
						fips: {
							tls: argv["settings-fips-tls"],
						},
						host_selector: {
							enabled: argv["settings-host-selector-enabled"],
						},
						inspection: {
							mode: argv["settings-inspection-mode"],
						},
						max_ttl_secs: argv["settings-max-ttl-secs"],
						protocol_detection: {
							enabled: argv["settings-protocol-detection-enabled"],
						},
						regions: parseJsonMap(argv["settings-regions"], "settings-regions"),
						sandbox: {
							enabled: argv["settings-sandbox-enabled"],
							fallback_action: argv["settings-sandbox-fallback-action"],
						},
						tls_decrypt: {
							enabled: argv["settings-tls-decrypt-enabled"],
						},
					},
				},
				[["settings", "regions"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
