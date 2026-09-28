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
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust gateway configurations update\n\nUpdate the current Zero Trust account configuration."
		)
		.option("settings-activity-log-enabled", {
			type: "boolean",
			description: "Specify whether to log activity.",
		})
		.option("settings-antivirus-enabled-download-phase", {
			type: "boolean",
			description:
				"Specify whether to enable anti-virus scanning on downloads.",
		})
		.option("settings-antivirus-enabled-upload-phase", {
			type: "boolean",
			description: "Specify whether to enable anti-virus scanning on uploads.",
		})
		.option("settings-antivirus-fail-closed", {
			type: "boolean",
			description: "Specify whether to block requests for unscannable files.",
		})
		.option("settings-antivirus-notification-settings-enabled", {
			type: "boolean",
			description: "Specify whether to enable notifications.",
		})
		.option("settings-antivirus-notification-settings-include-context", {
			type: "boolean",
			description:
				"Specify whether to include context information as query parameters.",
		})
		.option("settings-antivirus-notification-settings-msg", {
			type: "string",
			description: "Specify the message to show in the notification.",
		})
		.option("settings-antivirus-notification-settings-support-url", {
			type: "string",
			description:
				"Specify a URL that directs users to more information. If unset, the notification opens a block page.",
		})
		.option("settings-block-page-background-color", {
			type: "string",
			description:
				"Specify the block page background color in `#rrggbb` format when the mode is customized_block_page.",
		})
		.option("settings-block-page-enabled", {
			type: "boolean",
			description: "Specify whether to enable the custom block page.",
		})
		.option("settings-block-page-footer-text", {
			type: "string",
			description:
				"Specify the block page footer text when the mode is customized_block_page.",
		})
		.option("settings-block-page-header-text", {
			type: "string",
			description:
				"Specify the block page header text when the mode is customized_block_page.",
		})
		.option("settings-block-page-include-context", {
			type: "boolean",
			description:
				"Specify whether to append context to target_uri as query parameters. This applies only when the mode is redirect_uri.",
		})
		.option("settings-block-page-logo-path", {
			type: "string",
			description:
				"Specify the full URL to the logo file when the mode is customized_block_page.",
		})
		.option("settings-block-page-mailto-address", {
			type: "string",
			description:
				"Specify the admin email for users to contact when the mode is customized_block_page.",
		})
		.option("settings-block-page-mailto-subject", {
			type: "string",
			description:
				"Specify the subject line for emails created from the block page when the mode is customized_block_page.",
		})
		.option("settings-block-page-mode", {
			type: "string",
			description:
				"Specify whether to redirect users to a Cloudflare-hosted block page or a customer-provided URI.",
			choices: ["customized_block_page", "redirect_uri"],
		})
		.option("settings-block-page-name", {
			type: "string",
			description:
				"Specify the block page title when the mode is customized_block_page.",
		})
		.option("settings-block-page-suppress-footer", {
			type: "boolean",
			description:
				"Specify whether to suppress detailed information at the bottom of the block page when the mode is customized_block_page.",
		})
		.option("settings-block-page-target-uri", {
			type: "string",
			description:
				"Specify the URI to redirect users to when the mode is redirect_uri.",
		})
		.option("settings-body-scanning-inspection-mode", {
			type: "string",
			description: "Specify the inspection mode as either `deep` or `shallow`.",
			choices: ["deep", "shallow"],
		})
		.option("settings-browser-isolation-non-identity-enabled", {
			type: "boolean",
			description:
				"Specify whether to enable non-identity onramp support for Browser Isolation.",
		})
		.option("settings-browser-isolation-url-browser-isolation-enabled", {
			type: "boolean",
			description: "Specify whether to enable Clientless Browser Isolation.",
		})
		.option("settings-certificate-id", {
			type: "string",
			description:
				"Specify the UUID of the certificate used for interception. Ensure the certificate is available at the edge(previously called 'active'). A nil UUID directs Cloudflare to use the Root CA.",
		})
		.option("settings-custom-certificate-enabled", {
			type: "boolean",
			description:
				"Specify whether to enable a custom certificate authority for signing Gateway traffic.",
		})
		.option("settings-custom-certificate-id", {
			type: "string",
			description:
				"Specify the UUID of the certificate (ID from MTLS certificate store).",
		})
		.option("settings-extended-email-matching-enabled", {
			type: "boolean",
			description:
				"Specify whether to match all variants of user emails (with + or . modifiers) used as criteria in Firewall policies.",
		})
		.option("settings-fips-tls", {
			type: "boolean",
			description:
				"Enforce cipher suites and TLS versions compliant with FIPS 140-2.",
		})
		.option("settings-host-selector-enabled", {
			type: "boolean",
			description:
				"Specify whether to enable filtering via hosts for egress policies.",
		})
		.option("settings-inspection-mode", {
			type: "string",
			description:
				"Define the proxy inspection mode.   1. static: Gateway applies static inspection to HTTP on TCP(80). With TLS decryption on, Gateway inspects HTTPS traffic on TCP(443) and UDP(443).   2. dynamic: Gateway applies protocol detection to inspect HTTP and HTTPS traffic on any port. TLS decryption must remain on to inspect HTTPS traffic.",
			choices: ["static", "dynamic"],
		})
		.option("settings-max-ttl-secs", {
			type: "number",
			description:
				"Account-level cap on DNS response TTLs, in seconds. Gateway rewrites DNS responses so returned record TTLs do not exceed this value. Null means no cap. Each DNS location can inherit, override, or disable it through the location `max_ttl` setting.",
		})
		.option("settings-protocol-detection-enabled", {
			type: "boolean",
			description:
				"Specify whether to detect protocols from the initial bytes of client traffic.",
		})
		.option("settings-sandbox-enabled", {
			type: "boolean",
			description: "Specify whether to enable the sandbox.",
		})
		.option("settings-sandbox-fallback-action", {
			type: "string",
			description:
				"Specify the action to take when the system cannot scan the file.",
			choices: ["allow", "block"],
		})
		.option("settings-tls-decrypt-enabled", {
			type: "boolean",
			description: "Specify whether to inspect encrypted HTTP traffic.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Specify account settings.",
		})
		.check((argv) => {
			const groupSet = [
				"settings-activity-log-enabled",
				"settings-antivirus-enabled-download-phase",
				"settings-antivirus-enabled-upload-phase",
				"settings-antivirus-fail-closed",
				"settings-antivirus-notification-settings-enabled",
				"settings-antivirus-notification-settings-include-context",
				"settings-antivirus-notification-settings-msg",
				"settings-antivirus-notification-settings-support-url",
				"settings-block-page-background-color",
				"settings-block-page-enabled",
				"settings-block-page-footer-text",
				"settings-block-page-header-text",
				"settings-block-page-include-context",
				"settings-block-page-logo-path",
				"settings-block-page-mailto-address",
				"settings-block-page-mailto-subject",
				"settings-block-page-mode",
				"settings-block-page-name",
				"settings-block-page-suppress-footer",
				"settings-block-page-target-uri",
				"settings-body-scanning-inspection-mode",
				"settings-browser-isolation-non-identity-enabled",
				"settings-browser-isolation-url-browser-isolation-enabled",
				"settings-certificate-id",
				"settings-custom-certificate-enabled",
				"settings-custom-certificate-id",
				"settings-extended-email-matching-enabled",
				"settings-fips-tls",
				"settings-host-selector-enabled",
				"settings-inspection-mode",
				"settings-max-ttl-secs",
				"settings-protocol-detection-enabled",
				"settings-sandbox-enabled",
				"settings-sandbox-fallback-action",
				"settings-tls-decrypt-enabled",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"settings-certificate-id",
					"settings-custom-certificate-enabled",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --settings-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"zero-trust-accounts-update-zero-trust-account-configuration.">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Zero Trust account configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
				} satisfies ArgClassification<Args>,
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
								: compactBody({
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
												mode: resolveFileToken(
													argv["settings-block-page-mode"] as
														| string
														| undefined,
													"settings-block-page-mode",
													"text"
												),
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
												inspection_mode: resolveFileToken(
													argv["settings-body-scanning-inspection-mode"] as
														| string
														| undefined,
													"settings-body-scanning-inspection-mode",
													"text"
												),
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
												mode: resolveFileToken(
													argv["settings-inspection-mode"] as
														| string
														| undefined,
													"settings-inspection-mode",
													"text"
												),
											},
											max_ttl_secs: argv["settings-max-ttl-secs"],
											protocol_detection: {
												enabled: argv["settings-protocol-detection-enabled"],
											},
											sandbox: {
												enabled: argv["settings-sandbox-enabled"],
												fallback_action: resolveFileToken(
													argv["settings-sandbox-fallback-action"] as
														| string
														| undefined,
													"settings-sandbox-fallback-action",
													"text"
												),
											},
											tls_decrypt: {
												enabled: argv["settings-tls-decrypt-enabled"],
											},
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.gateway.configurations.update({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
							mode: resolveFileToken(
								argv["settings-block-page-mode"] as string | undefined,
								"settings-block-page-mode",
								"text"
							),
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
							inspection_mode: resolveFileToken(
								argv["settings-body-scanning-inspection-mode"] as
									| string
									| undefined,
								"settings-body-scanning-inspection-mode",
								"text"
							),
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
							mode: resolveFileToken(
								argv["settings-inspection-mode"] as string | undefined,
								"settings-inspection-mode",
								"text"
							),
						},
						max_ttl_secs: argv["settings-max-ttl-secs"],
						protocol_detection: {
							enabled: argv["settings-protocol-detection-enabled"],
						},
						sandbox: {
							enabled: argv["settings-sandbox-enabled"],
							fallback_action: resolveFileToken(
								argv["settings-sandbox-fallback-action"] as string | undefined,
								"settings-sandbox-fallback-action",
								"text"
							),
						},
						tls_decrypt: {
							enabled: argv["settings-tls-decrypt-enabled"],
						},
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.gateway.configurations.update({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
