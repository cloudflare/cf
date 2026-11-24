import operation from "../../_operations/zero-trust/organization/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust organization update",
			classification: {
				safeFlags: [
					"allow-authenticate-via-warp",
					"auto-redirect-to-identity",
					"deny-unmatched-requests",
					"disable-end-user-app-creation",
					"is-ui-read-only",
					"mfa-piv-key-requirements-pin-policy",
					"mfa-piv-key-requirements-require-fips-device",
					"mfa-piv-key-requirements-touch-policy",
					"mfa-required-for-all-apps",
					"service-token-inactivity-action",
					"service-token-inactivity-enabled",
					"strict-service-token-auth",
					"warp-auth-non-browser-401",
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
					command: "cf zero-trust organization update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/access/organizations`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
						"account-or-zone-id": String(accountOrZoneId),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									allow_authenticate_via_warp:
										argv["allow-authenticate-via-warp"],
									auth_domain: resolveFileToken(
										argv["auth-domain"] as string | undefined,
										"auth-domain",
										"text"
									),
									auto_redirect_to_identity: argv["auto-redirect-to-identity"],
									custom_pages: {
										forbidden: resolveFileToken(
											argv["custom-pages-forbidden"] as string | undefined,
											"custom-pages-forbidden",
											"text"
										),
										identity_denied: resolveFileToken(
											argv["custom-pages-identity-denied"] as
												| string
												| undefined,
											"custom-pages-identity-denied",
											"text"
										),
									},
									deny_unmatched_requests: argv["deny-unmatched-requests"],
									deny_unmatched_requests_exempted_zone_names:
										argv["deny-unmatched-requests-exempted-zone-names"],
									disable_end_user_app_creation:
										argv["disable-end-user-app-creation"],
									is_ui_read_only: argv["is-ui-read-only"],
									login_design: {
										background_color: resolveFileToken(
											argv["login-design-background-color"] as
												| string
												| undefined,
											"login-design-background-color",
											"text"
										),
										footer_text: resolveFileToken(
											argv["login-design-footer-text"] as string | undefined,
											"login-design-footer-text",
											"text"
										),
										header_text: resolveFileToken(
											argv["login-design-header-text"] as string | undefined,
											"login-design-header-text",
											"text"
										),
										logo_path: resolveFileToken(
											argv["login-design-logo-path"] as string | undefined,
											"login-design-logo-path",
											"text"
										),
										text_color: resolveFileToken(
											argv["login-design-text-color"] as string | undefined,
											"login-design-text-color",
											"text"
										),
									},
									mfa_config: {
										allowed_authenticators:
											argv["mfa-config-allowed-authenticators"],
										amr_matching_session_duration: resolveFileToken(
											argv["mfa-config-amr-matching-session-duration"] as
												| string
												| undefined,
											"mfa-config-amr-matching-session-duration",
											"text"
										),
										required_aaguids: resolveFileToken(
											argv["mfa-config-required-aaguids"] as string | undefined,
											"mfa-config-required-aaguids",
											"text"
										),
										session_duration: resolveFileToken(
											argv["mfa-config-session-duration"] as string | undefined,
											"mfa-config-session-duration",
											"text"
										),
									},
									mfa_piv_key_requirements: {
										pin_policy: argv["mfa-piv-key-requirements-pin-policy"],
										require_fips_device:
											argv["mfa-piv-key-requirements-require-fips-device"],
										ssh_key_size: argv["mfa-piv-key-requirements-ssh-key-size"],
										ssh_key_type: argv["mfa-piv-key-requirements-ssh-key-type"],
										touch_policy: argv["mfa-piv-key-requirements-touch-policy"],
									},
									mfa_required_for_all_apps: argv["mfa-required-for-all-apps"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									service_token_inactivity: {
										action: argv["service-token-inactivity-action"],
										enabled: argv["service-token-inactivity-enabled"],
										inactivity_threshold_days:
											argv[
												"service-token-inactivity-inactivity-threshold-days"
											],
									},
									session_duration: resolveFileToken(
										argv["session-duration"] as string | undefined,
										"session-duration",
										"text"
									),
									strict_service_token_auth: argv["strict-service-token-auth"],
									ui_read_only_toggle_reason: resolveFileToken(
										argv["ui-read-only-toggle-reason"] as string | undefined,
										"ui-read-only-toggle-reason",
										"text"
									),
									user_seat_expiration_inactive_time: resolveFileToken(
										argv["user-seat-expiration-inactive-time"] as
											| string
											| undefined,
										"user-seat-expiration-inactive-time",
										"text"
									),
									warp_auth_non_browser_401: argv["warp-auth-non-browser-401"],
									warp_auth_session_duration: resolveFileToken(
										argv["warp-auth-session-duration"] as string | undefined,
										"warp-auth-session-duration",
										"text"
									),
								}),
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
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				allow_authenticate_via_warp: argv["allow-authenticate-via-warp"],
				auth_domain: resolveFileToken(
					argv["auth-domain"] as string | undefined,
					"auth-domain",
					"text"
				),
				auto_redirect_to_identity: argv["auto-redirect-to-identity"],
				custom_pages: {
					forbidden: resolveFileToken(
						argv["custom-pages-forbidden"] as string | undefined,
						"custom-pages-forbidden",
						"text"
					),
					identity_denied: resolveFileToken(
						argv["custom-pages-identity-denied"] as string | undefined,
						"custom-pages-identity-denied",
						"text"
					),
				},
				deny_unmatched_requests: argv["deny-unmatched-requests"],
				deny_unmatched_requests_exempted_zone_names:
					argv["deny-unmatched-requests-exempted-zone-names"],
				disable_end_user_app_creation: argv["disable-end-user-app-creation"],
				is_ui_read_only: argv["is-ui-read-only"],
				login_design: {
					background_color: resolveFileToken(
						argv["login-design-background-color"] as string | undefined,
						"login-design-background-color",
						"text"
					),
					footer_text: resolveFileToken(
						argv["login-design-footer-text"] as string | undefined,
						"login-design-footer-text",
						"text"
					),
					header_text: resolveFileToken(
						argv["login-design-header-text"] as string | undefined,
						"login-design-header-text",
						"text"
					),
					logo_path: resolveFileToken(
						argv["login-design-logo-path"] as string | undefined,
						"login-design-logo-path",
						"text"
					),
					text_color: resolveFileToken(
						argv["login-design-text-color"] as string | undefined,
						"login-design-text-color",
						"text"
					),
				},
				mfa_config: {
					allowed_authenticators: argv["mfa-config-allowed-authenticators"],
					amr_matching_session_duration: resolveFileToken(
						argv["mfa-config-amr-matching-session-duration"] as
							| string
							| undefined,
						"mfa-config-amr-matching-session-duration",
						"text"
					),
					required_aaguids: resolveFileToken(
						argv["mfa-config-required-aaguids"] as string | undefined,
						"mfa-config-required-aaguids",
						"text"
					),
					session_duration: resolveFileToken(
						argv["mfa-config-session-duration"] as string | undefined,
						"mfa-config-session-duration",
						"text"
					),
				},
				mfa_piv_key_requirements: {
					pin_policy: argv["mfa-piv-key-requirements-pin-policy"],
					require_fips_device:
						argv["mfa-piv-key-requirements-require-fips-device"],
					ssh_key_size: argv["mfa-piv-key-requirements-ssh-key-size"],
					ssh_key_type: argv["mfa-piv-key-requirements-ssh-key-type"],
					touch_policy: argv["mfa-piv-key-requirements-touch-policy"],
				},
				mfa_required_for_all_apps: argv["mfa-required-for-all-apps"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				service_token_inactivity: {
					action: argv["service-token-inactivity-action"],
					enabled: argv["service-token-inactivity-enabled"],
					inactivity_threshold_days:
						argv["service-token-inactivity-inactivity-threshold-days"],
				},
				session_duration: resolveFileToken(
					argv["session-duration"] as string | undefined,
					"session-duration",
					"text"
				),
				strict_service_token_auth: argv["strict-service-token-auth"],
				ui_read_only_toggle_reason: resolveFileToken(
					argv["ui-read-only-toggle-reason"] as string | undefined,
					"ui-read-only-toggle-reason",
					"text"
				),
				user_seat_expiration_inactive_time: resolveFileToken(
					argv["user-seat-expiration-inactive-time"] as string | undefined,
					"user-seat-expiration-inactive-time",
					"text"
				),
				warp_auth_non_browser_401: argv["warp-auth-non-browser-401"],
				warp_auth_session_duration: resolveFileToken(
					argv["warp-auth-session-duration"] as string | undefined,
					"warp-auth-session-duration",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_or_zone: accountOrZone,
					account_or_zone_id: accountOrZoneId,
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
