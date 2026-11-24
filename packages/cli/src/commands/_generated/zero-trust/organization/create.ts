/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"allow-authenticate-via-warp": {
			kind: "boolean",
			brief:
				"When set to true, users can authenticate via WARP for any application in your organization. Application settings will take precedence over this value.",
			default: false,
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
			default: false,
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
			default: false,
		},
		"is-ui-read-only": {
			kind: "boolean",
			brief:
				"Lock all settings as Read-Only in the Dashboard, regardless of user permission. Updates may only be made via the API or Terraform for this account when enabled.",
			default: false,
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
			default: false,
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
			default: false,
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create your Zero Trust organization",
	usage:
		"$0 zero-trust organization create\n\nSets up a Zero Trust organization for your account or zone.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
