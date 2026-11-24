/**
 * edit command
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
		"settings-activity-log-enabled": {
			kind: "boolean",
			brief: "Specify whether to log activity.",
			optional: true,
		},
		"settings-antivirus-enabled-download-phase": {
			kind: "boolean",
			brief: "Specify whether to enable anti-virus scanning on downloads.",
			optional: true,
		},
		"settings-antivirus-enabled-upload-phase": {
			kind: "boolean",
			brief: "Specify whether to enable anti-virus scanning on uploads.",
			optional: true,
		},
		"settings-antivirus-fail-closed": {
			kind: "boolean",
			brief: "Specify whether to block requests for unscannable files.",
			optional: true,
		},
		"settings-antivirus-notification-settings-enabled": {
			kind: "boolean",
			brief: "Specify whether to enable notifications.",
			optional: true,
		},
		"settings-antivirus-notification-settings-include-context": {
			kind: "boolean",
			brief:
				"Specify whether to include context information as query parameters.",
			optional: true,
		},
		"settings-antivirus-notification-settings-msg": {
			kind: "parsed",
			brief: "Specify the message to show in the notification.",
			optional: true,
			parse: String,
		},
		"settings-antivirus-notification-settings-support-url": {
			kind: "parsed",
			brief:
				"Specify a URL that directs users to more information. If unset, the notification opens a block page.",
			optional: true,
			parse: String,
		},
		"settings-block-page-background-color": {
			kind: "parsed",
			brief:
				"Specify the block page background color in `#rrggbb` format when the mode is customized_block_page.",
			optional: true,
			parse: String,
		},
		"settings-block-page-enabled": {
			kind: "boolean",
			brief: "Specify whether to enable the custom block page.",
			optional: true,
		},
		"settings-block-page-footer-text": {
			kind: "parsed",
			brief:
				"Specify the block page footer text when the mode is customized_block_page.",
			optional: true,
			parse: String,
		},
		"settings-block-page-header-text": {
			kind: "parsed",
			brief:
				"Specify the block page header text when the mode is customized_block_page.",
			optional: true,
			parse: String,
		},
		"settings-block-page-include-context": {
			kind: "boolean",
			brief:
				"Specify whether to append context to target_uri as query parameters. This applies only when the mode is redirect_uri.",
			optional: true,
		},
		"settings-block-page-logo-path": {
			kind: "parsed",
			brief:
				"Specify the full URL to the logo file when the mode is customized_block_page.",
			optional: true,
			parse: String,
		},
		"settings-block-page-mailto-address": {
			kind: "parsed",
			brief:
				"Specify the admin email for users to contact when the mode is customized_block_page.",
			optional: true,
			parse: String,
		},
		"settings-block-page-mailto-subject": {
			kind: "parsed",
			brief:
				"Specify the subject line for emails created from the block page when the mode is customized_block_page.",
			optional: true,
			parse: String,
		},
		"settings-block-page-mode": {
			kind: "parsed",
			brief:
				"Specify whether to redirect users to a Cloudflare-hosted block page or a customer-provided URI.",
			optional: true,
			choices: ["customized_block_page", "redirect_uri"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "settings-block-page-mode", "text"),
		},
		"settings-block-page-name": {
			kind: "parsed",
			brief:
				"Specify the block page title when the mode is customized_block_page.",
			optional: true,
			parse: String,
		},
		"settings-block-page-suppress-footer": {
			kind: "boolean",
			brief:
				"Specify whether to suppress detailed information at the bottom of the block page when the mode is customized_block_page.",
			optional: true,
		},
		"settings-block-page-target-uri": {
			kind: "parsed",
			brief:
				"Specify the URI to redirect users to when the mode is redirect_uri.",
			optional: true,
			parse: String,
		},
		"settings-body-scanning-inspection-mode": {
			kind: "parsed",
			brief: "Specify the inspection mode as either `deep` or `shallow`.",
			optional: true,
			choices: ["deep", "shallow"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"settings-body-scanning-inspection-mode",
					"text"
				),
		},
		"settings-browser-isolation-non-identity-enabled": {
			kind: "boolean",
			brief:
				"Specify whether to enable non-identity onramp support for Browser Isolation.",
			optional: true,
		},
		"settings-browser-isolation-url-browser-isolation-enabled": {
			kind: "boolean",
			brief: "Specify whether to enable Clientless Browser Isolation.",
			optional: true,
		},
		"settings-certificate-id": {
			kind: "parsed",
			brief:
				"Specify the UUID of the certificate used for interception. Ensure the certificate is available at the edge(previously called 'active'). A nil UUID directs Cloudflare to use the Root CA.",
			optional: true,
			parse: String,
		},
		"settings-custom-certificate-enabled": {
			kind: "boolean",
			brief:
				"Specify whether to enable a custom certificate authority for signing Gateway traffic.",
			optional: true,
		},
		"settings-custom-certificate-id": {
			kind: "parsed",
			brief:
				"Specify the UUID of the certificate (ID from MTLS certificate store).",
			optional: true,
			parse: String,
		},
		"settings-extended-email-matching-enabled": {
			kind: "boolean",
			brief:
				"Specify whether to match all variants of user emails (with + or . modifiers) used as criteria in Firewall policies.",
			optional: true,
		},
		"settings-fips-tls": {
			kind: "boolean",
			brief:
				"Enforce cipher suites and TLS versions compliant with FIPS 140-2.",
			optional: true,
		},
		"settings-host-selector-enabled": {
			kind: "boolean",
			brief:
				"Specify whether to enable filtering via hosts for egress policies.",
			optional: true,
		},
		"settings-inspection-mode": {
			kind: "parsed",
			brief:
				"Define the proxy inspection mode. 1. static: Gateway applies static inspection to HTTP on TCP(80). With TLS decryption on, Gateway inspects HTTPS traffic on TCP(443) and UDP(443). 2. dynamic: Gateway applies protocol detection to inspect HTTP and HTTPS traffic on any port. TLS decryption must remain on to inspect HTTPS traffic.",
			optional: true,
			choices: ["static", "dynamic"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "settings-inspection-mode", "text"),
		},
		"settings-max-ttl-secs": {
			kind: "parsed",
			brief:
				"Account-level cap on DNS response TTLs, in seconds. Gateway rewrites DNS responses so returned record TTLs do not exceed this value. Null means no cap. Each DNS location can inherit, override, or disable it through the location `max_ttl` setting.",
			optional: true,
			parse: Number,
		},
		"settings-protocol-detection-enabled": {
			kind: "boolean",
			brief:
				"Specify whether to detect protocols from the initial bytes of client traffic.",
			optional: true,
		},
		"settings-regions": {
			kind: "parsed",
			brief:
				'Specify per-region TLS interception and certificate settings for Gateway, keyed by Data Localization Suite region key. Relies on the Zero Trust account region setting  (`GET`/`PUT /accounts/{account_id}/zerotrust/region`) - the account must select a region before Gateway applies these settings for it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"settings-sandbox-enabled": {
			kind: "boolean",
			brief: "Specify whether to enable the sandbox.",
			optional: true,
		},
		"settings-sandbox-fallback-action": {
			kind: "parsed",
			brief: "Specify the action to take when the system cannot scan the file.",
			optional: true,
			choices: ["allow", "block"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "settings-sandbox-fallback-action", "text"),
		},
		"settings-tls-decrypt-enabled": {
			kind: "boolean",
			brief: "Specify whether to inspect encrypted HTTP traffic.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Specify account settings.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"settings-custom-certificate-enabled",
				"settings-custom-certificate-id",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["settings-custom-certificate-enabled"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --settings-custom-certificate-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit",
	describe: "Patch Zero Trust account configuration",
	usage:
		"$0 zero-trust gateway configurations edit\n\nUpdate (PATCH) a single subcollection of settings such as `antivirus`, `tls_decrypt`, `activity_log`, `block_page`, `browser_isolation`, `fips`, `body_scanning`, `certificate`, or `max_ttl_secs` without updating the entire configuration object. This endpoint returns an error if any settings collection lacks proper configuration.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
