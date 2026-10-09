import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust organization create\n\nSets up a Zero Trust organization for your account or zone."
		)
		.option("allow-authenticate-via-warp", {
			type: "boolean",
			description:
				"When set to true, users can authenticate via WARP for any application in your organization. Application settings will take precedence over this value.",
			default: false,
		})
		.option("auth-domain", {
			type: "string",
			description:
				"The unique subdomain assigned to your Zero Trust organization. If omitted on creation, a unique subdomain is auto-generated in the format `adjective-noun-hex4` (e.g. `frosty-moon-7a3b.cloudflareaccess.com`).",
		})
		.option("auto-redirect-to-identity", {
			type: "boolean",
			description:
				"When set to `true`, users skip the identity provider selection step during login.",
			default: false,
		})
		.option("deny-unmatched-requests", {
			type: "boolean",
			description:
				"Determines whether to deny all requests to Cloudflare-protected resources that lack an associated Access application. If enabled, you must explicitly configure an Access application and policy to allow traffic to your Cloudflare-protected resources. For domains you want to be public across all subdomains, add the domain to the `deny_unmatched_requests_exempted_zone_names` array.",
		})
		.option("deny-unmatched-requests-exempted-zone-names", {
			type: "string",
			array: true,
			description:
				"Contains zone names to exempt from the `deny_unmatched_requests` feature. Requests to a subdomain in an exempted zone will block unauthenticated traffic by default if there is a configured Access application and policy that matches the request.",
		})
		.option("is-ui-read-only", {
			type: "boolean",
			description:
				"Lock all settings as Read-Only in the Dashboard, regardless of user permission. Updates may only be made via the API or Terraform for this account when enabled.",
			default: false,
		})
		.option("login-design-background-color", {
			type: "string",
			description: "The background color on your login page.",
		})
		.option("login-design-footer-text", {
			type: "string",
			description: "The text at the bottom of your login page.",
		})
		.option("login-design-header-text", {
			type: "string",
			description: "The text at the top of your login page.",
		})
		.option("login-design-logo-path", {
			type: "string",
			description: "The URL of the logo on your login page.",
		})
		.option("login-design-text-color", {
			type: "string",
			description: "The text color on your login page.",
		})
		.option("mfa-config-allowed-authenticators", {
			type: "string",
			array: true,
			description:
				"Lists the MFA methods that users can authenticate with. The `piv_key` and `ssh_fido2_key` values are supported only for infrastructure applications.",
		})
		.option("mfa-config-amr-matching-session-duration", {
			type: "string",
			description:
				'Allows a user to skip MFA via Authentication Method Reference (AMR) matching when the AMR claim provided by the IdP the user used to authenticate contains "mfa". Must be in minutes (m) or hours (h). Minimum: 0m. Maximum: 720h (30 days).',
		})
		.option("mfa-config-required-aaguids", {
			type: "string",
			description:
				"Specifies a Cloudflare List of required FIDO2 authenticator device AAGUIDs.",
		})
		.option("mfa-config-session-duration", {
			type: "string",
			description:
				"Defines the duration of an MFA session. Must be in minutes (m) or hours (h). Minimum: 0m. Maximum: 720h (30 days). Examples:`5m` or `24h`.",
		})
		.option("mfa-piv-key-requirements-pin-policy", {
			type: "string",
			description:
				"Defines when a PIN is required to use the SSH key. Valid values: `never` (no PIN required), `once` (PIN required once per session), `always` (PIN required for each use).",
			choices: ["never", "once", "always"],
		})
		.coerce(
			"mfa-piv-key-requirements-pin-policy",
			(value: string | undefined) =>
				resolveFileToken(value, "mfa-piv-key-requirements-pin-policy", "text")
		)
		.option("mfa-piv-key-requirements-require-fips-device", {
			type: "boolean",
			description:
				"Requires the PIV key to be stored on a FIPS 140-2 Level 1 or higher validated device.",
		})
		.option("mfa-piv-key-requirements-ssh-key-size", {
			type: "string",
			array: true,
			description:
				"Specifies the allowed SSH key sizes in bits. Valid sizes depend on key type. Ed25519 has a fixed key size and does not accept this parameter.",
		})
		.option("mfa-piv-key-requirements-ssh-key-type", {
			type: "string",
			array: true,
			description:
				"Specifies the allowed SSH key types. Valid values are `ecdsa`, `ed25519`, and `rsa`.",
		})
		.option("mfa-piv-key-requirements-touch-policy", {
			type: "string",
			description:
				"Defines when physical touch is required to use the SSH key. Valid values: `never` (no touch required), `always` (touch required for each use), `cached` (touch cached for 15 seconds).",
			choices: ["never", "always", "cached"],
		})
		.coerce(
			"mfa-piv-key-requirements-touch-policy",
			(value: string | undefined) =>
				resolveFileToken(value, "mfa-piv-key-requirements-touch-policy", "text")
		)
		.option("mfa-required-for-all-apps", {
			type: "boolean",
			description:
				"Determines whether global MFA settings apply to applications by default. The organization must have MFA enabled with at least one authentication method and a session duration configured. Note: 'allowed_authenticators' cannot contain only the infrastructure SSH authenticators ('piv_key' and 'ssh_fido2_key') if the organization has any non-infrastructure applications.",
			default: false,
		})
		.option("name", {
			type: "string",
			description:
				"The name of your Zero Trust organization. When omitted on creation, defaults to the provided auth_domain; when both are omitted, defaults to the auto-generated subdomain slug (e.g. frosty-moon-7a3b).",
		})
		.option("service-token-inactivity-action", {
			type: "string",
			description: "The action applied to an inactive service token.",
			choices: ["disable", "delete"],
		})
		.coerce("service-token-inactivity-action", (value: string | undefined) =>
			resolveFileToken(value, "service-token-inactivity-action", "text")
		)
		.option("service-token-inactivity-enabled", {
			type: "boolean",
			description:
				"Whether automatic enforcement for inactive service tokens is enabled.",
		})
		.option("service-token-inactivity-inactivity-threshold-days", {
			type: "number",
			description:
				"The number of days a service token must be inactive before the configured action is applied.",
		})
		.option("session-duration", {
			type: "string",
			description:
				"The amount of time that tokens issued for applications will be valid. Must be in the format `300ms` or `2h45m`. Valid time units are: ns, us (or µs), ms, s, m, h.",
		})
		.option("strict-service-token-auth", {
			type: "boolean",
			description:
				"Enables new behaviors for requests made with Access service tokens. Unauthorized requests emit audit logs, and return a 401 or 403 status code in the response instead of redirecting to the login page. Successful requests no longer receive a CF_Authorization cookie in the response. Zero Trust organizations created on or after October 5, 2026 will have this setting enabled by default, and cannot disable it.",
		})
		.option("ui-read-only-toggle-reason", {
			type: "string",
			description:
				"A description of the reason why the UI read only field is being toggled.",
		})
		.option("user-seat-expiration-inactive-time", {
			type: "string",
			description:
				"The amount of time a user seat is inactive before it expires. When the user seat exceeds the set time of inactivity, the user is removed as an active seat and no longer counts against your Teams seat count.  Minimum value for this setting is 1 month (730h). Must be in the format `300ms` or `2h45m`. Valid time units are: `ns`, `us` (or `µs`), `ms`, `s`, `m`, `h`.",
		})
		.option("warp-auth-non-browser-401", {
			type: "boolean",
			description:
				"When enabled, unsuccessful WARP authentication requests with a non-HTML Accept header return a 401 response instead of redirecting to the login page.",
			default: false,
		})
		.option("warp-auth-session-duration", {
			type: "string",
			description:
				"The amount of time that tokens issued for applications will be valid. Must be in the format `30m` or `2h45m`. Valid time units are: m, h.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"service-token-inactivity-action",
				"service-token-inactivity-enabled",
				"service-token-inactivity-inactivity-threshold-days",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"service-token-inactivity-action",
					"service-token-inactivity-enabled",
					"service-token-inactivity-inactivity-threshold-days",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --service_token_inactivity-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/access/organizations">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create your Zero Trust organization",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust organization create",
				classification: {
					safeFlags: [
						"allow-authenticate-via-warp",
						"auto-redirect-to-identity",
						"deny-unmatched-requests",
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
				} satisfies ArgClassification<Args>,
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
						command: "cf zero-trust organization create",
						method: "POST",
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
										deny_unmatched_requests: argv["deny-unmatched-requests"],
										deny_unmatched_requests_exempted_zone_names:
											argv["deny-unmatched-requests-exempted-zone-names"],
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

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.organization.create({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					allow_authenticate_via_warp: argv["allow-authenticate-via-warp"],
					auth_domain: resolveFileToken(
						argv["auth-domain"] as string | undefined,
						"auth-domain",
						"text"
					),
					auto_redirect_to_identity: argv["auto-redirect-to-identity"],
					deny_unmatched_requests: argv["deny-unmatched-requests"],
					deny_unmatched_requests_exempted_zone_names:
						argv["deny-unmatched-requests-exempted-zone-names"],
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
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.organization.create({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
