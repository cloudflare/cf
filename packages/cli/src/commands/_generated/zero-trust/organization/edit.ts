import operation from "../../_operations/zero-trust/organization/edit.js";
/**
 * edit command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "edit",
	describe: "Partially update your Zero Trust organization",
	usage:
		"$0 zero-trust organization edit\n\nUpdates only the fields included in the request body. Omitted fields keep their current values. To clear `mfa_config` or `mfa_piv_key_requirements`, send the field as `{}`.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"allow-authenticate-via-warp": {
			kind: "boolean",
			brief:
				"When set to true, users can authenticate via WARP for any application in your organization. Application settings will take precedence over this value.",
			optional: true,
		},
		"auth-domain": {
			kind: "parsed",
			brief:
				"The unique subdomain assigned to your Zero Trust organization. If omitted on creation, a unique subdomain is auto-generated in the format `adjective-noun-hex4` (e.g. `frosty-moon-7a3b.cloudflareaccess.com`).",
			optional: true,
			parse: String,
		},
		"auto-redirect-to-identity": {
			kind: "boolean",
			brief:
				"When set to `true`, users skip the identity provider selection step during login.",
			optional: true,
		},
		"custom-pages-forbidden": {
			kind: "parsed",
			brief:
				"The uid of the custom page to use when a user is denied access after failing a non-identity rule.",
			optional: true,
			parse: String,
		},
		"custom-pages-identity-denied": {
			kind: "parsed",
			brief: "The uid of the custom page to use when a user is denied access.",
			optional: true,
			parse: String,
		},
		"deny-unmatched-requests": {
			kind: "boolean",
			brief:
				"Determines whether to deny all requests to Cloudflare-protected resources that lack an associated Access application. If enabled, you must explicitly configure an Access application and policy to allow traffic to your Cloudflare-protected resources. For domains you want to be public across all subdomains, add the domain to the `deny_unmatched_requests_exempted_zone_names` array.",
			optional: true,
		},
		"deny-unmatched-requests-exempted-zone-names": {
			kind: "parsed",
			brief:
				"Contains zone names to exempt from the `deny_unmatched_requests` feature. Requests to a subdomain in an exempted zone will block unauthenticated traffic by default if there is a configured Access application and policy that matches the request.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"disable-end-user-app-creation": {
			kind: "boolean",
			brief:
				"Whether creation of end user applications is disabled for this organization.",
			optional: true,
		},
		"is-ui-read-only": {
			kind: "boolean",
			brief:
				"Lock all settings as Read-Only in the Dashboard, regardless of user permission. Updates may only be made via the API or Terraform for this account when enabled.",
			optional: true,
		},
		"login-design-background-color": {
			kind: "parsed",
			brief: "The background color on your login page.",
			optional: true,
			parse: String,
		},
		"login-design-footer-text": {
			kind: "parsed",
			brief: "The text at the bottom of your login page.",
			optional: true,
			parse: String,
		},
		"login-design-header-text": {
			kind: "parsed",
			brief: "The text at the top of your login page.",
			optional: true,
			parse: String,
		},
		"login-design-logo-path": {
			kind: "parsed",
			brief: "The URL of the logo on your login page.",
			optional: true,
			parse: String,
		},
		"login-design-text-color": {
			kind: "parsed",
			brief: "The text color on your login page.",
			optional: true,
			parse: String,
		},
		"mfa-config-allowed-authenticators": {
			kind: "parsed",
			brief:
				"Lists the MFA methods that users can authenticate with. The `piv_key` and `ssh_fido2_key` values are supported only for infrastructure applications.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"mfa-config-amr-matching-session-duration": {
			kind: "parsed",
			brief:
				'Allows a user to skip MFA via Authentication Method Reference (AMR) matching when the AMR claim provided by the IdP the user used to authenticate contains "mfa". Must be in minutes (m) or hours (h). Minimum: 0m. Maximum: 720h (30 days).',
			optional: true,
			parse: String,
		},
		"mfa-config-required-aaguids": {
			kind: "parsed",
			brief:
				"Specifies a Cloudflare List of required FIDO2 authenticator device AAGUIDs.",
			optional: true,
			parse: String,
		},
		"mfa-config-session-duration": {
			kind: "parsed",
			brief:
				"Defines the duration of an MFA session. Must be in minutes (m) or hours (h). Minimum: 0m. Maximum: 720h (30 days). Examples:`5m` or `24h`.",
			optional: true,
			parse: String,
		},
		"mfa-piv-key-requirements-pin-policy": {
			kind: "parsed",
			brief:
				"Defines when a PIN is required to use the SSH key. Valid values: `never` (no PIN required), `once` (PIN required once per session), `always` (PIN required for each use).",
			optional: true,
			choices: ["never", "once", "always"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "mfa-piv-key-requirements-pin-policy", "text"),
		},
		"mfa-piv-key-requirements-require-fips-device": {
			kind: "boolean",
			brief:
				"Requires the PIV key to be stored on a FIPS 140-2 Level 1 or higher validated device.",
			optional: true,
		},
		"mfa-piv-key-requirements-ssh-key-size": {
			kind: "parsed",
			brief:
				"Specifies the allowed SSH key sizes in bits. Valid sizes depend on key type. Ed25519 has a fixed key size and does not accept this parameter.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"mfa-piv-key-requirements-ssh-key-type": {
			kind: "parsed",
			brief:
				"Specifies the allowed SSH key types. Valid values are `ecdsa`, `ed25519`, and `rsa`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"mfa-piv-key-requirements-touch-policy": {
			kind: "parsed",
			brief:
				"Defines when physical touch is required to use the SSH key. Valid values: `never` (no touch required), `always` (touch required for each use), `cached` (touch cached for 15 seconds).",
			optional: true,
			choices: ["never", "always", "cached"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"mfa-piv-key-requirements-touch-policy",
					"text"
				),
		},
		"mfa-required-for-all-apps": {
			kind: "boolean",
			brief:
				"Determines whether global MFA settings apply to applications by default. The organization must have MFA enabled with at least one authentication method and a session duration configured. Note: 'allowed_authenticators' cannot contain only the infrastructure SSH authenticators ('piv_key' and 'ssh_fido2_key') if the organization has any non-infrastructure applications.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief:
				"The name of your Zero Trust organization. When omitted on creation, defaults to the provided auth_domain; when both are omitted, defaults to the auto-generated subdomain slug (e.g. frosty-moon-7a3b).",
			optional: true,
			parse: String,
		},
		"service-token-inactivity-action": {
			kind: "parsed",
			brief: "The action applied to an inactive service token.",
			optional: true,
			choices: ["disable", "delete"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "service-token-inactivity-action", "text"),
		},
		"service-token-inactivity-enabled": {
			kind: "boolean",
			brief:
				"Whether automatic enforcement for inactive service tokens is enabled.",
			optional: true,
		},
		"service-token-inactivity-inactivity-threshold-days": {
			kind: "parsed",
			brief:
				"The number of days a service token must be inactive before the configured action is applied.",
			optional: true,
			parse: Number,
		},
		"session-duration": {
			kind: "parsed",
			brief:
				"The amount of time that tokens issued for applications will be valid. Must be in the format `300ms` or `2h45m`. Valid time units are: ns, us (or µs), ms, s, m, h.",
			optional: true,
			parse: String,
		},
		"strict-service-token-auth": {
			kind: "boolean",
			brief:
				"Enables new behaviors for requests made with Access service tokens. Unauthorized requests emit audit logs, and return a 401 or 403 status code in the response instead of redirecting to the login page. Successful requests no longer receive a CF_Authorization cookie in the response. Zero Trust organizations created on or after October 5, 2026 will have this setting enabled by default, and cannot disable it.",
			optional: true,
		},
		"ui-read-only-toggle-reason": {
			kind: "parsed",
			brief:
				"A description of the reason why the UI read only field is being toggled.",
			optional: true,
			parse: String,
		},
		"user-seat-expiration-inactive-time": {
			kind: "parsed",
			brief:
				"The amount of time a user seat is inactive before it expires. When the user seat exceeds the set time of inactivity, the user is removed as an active seat and no longer counts against your Teams seat count.  Minimum value for this setting is 1 month (730h). Must be in the format `300ms` or `2h45m`. Valid time units are: `ns`, `us` (or `µs`), `ms`, `s`, `m`, `h`.",
			optional: true,
			parse: String,
		},
		"warp-auth-non-browser-401": {
			kind: "boolean",
			brief:
				"When enabled, unsuccessful WARP authentication requests with a non-HTML Accept header return a 401 response instead of redirecting to the login page.",
			optional: true,
		},
		"warp-auth-session-duration": {
			kind: "parsed",
			brief:
				"The amount of time that tokens issued for applications will be valid. Must be in the format `30m` or `2h45m`. Valid time units are: m, h.",
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"service-token-inactivity-action",
				"service-token-inactivity-enabled",
				"service-token-inactivity-inactivity-threshold-days",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"service-token-inactivity-action",
					"service-token-inactivity-enabled",
					"service-token-inactivity-inactivity-threshold-days",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --service-token-inactivity-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust organization edit",
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
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf zero-trust organization edit",
						method: "PATCH",
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
										auto_redirect_to_identity:
											argv["auto-redirect-to-identity"],
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
												argv["mfa-config-required-aaguids"] as
													| string
													| undefined,
												"mfa-config-required-aaguids",
												"text"
											),
											session_duration: resolveFileToken(
												argv["mfa-config-session-duration"] as
													| string
													| undefined,
												"mfa-config-session-duration",
												"text"
											),
										},
										mfa_piv_key_requirements: {
											pin_policy: argv["mfa-piv-key-requirements-pin-policy"],
											require_fips_device:
												argv["mfa-piv-key-requirements-require-fips-device"],
											ssh_key_size:
												argv["mfa-piv-key-requirements-ssh-key-size"],
											ssh_key_type:
												argv["mfa-piv-key-requirements-ssh-key-type"],
											touch_policy:
												argv["mfa-piv-key-requirements-touch-policy"],
										},
										mfa_required_for_all_apps:
											argv["mfa-required-for-all-apps"],
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
										strict_service_token_auth:
											argv["strict-service-token-auth"],
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
										warp_auth_non_browser_401:
											argv["warp-auth-non-browser-401"],
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
		),
});

export default command;
