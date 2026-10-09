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
		.usage(
			"$0 zero-trust gateway rules create\n\nCreate a new Zero Trust Gateway rule."
		)
		.option("action", {
			type: "string",
			description:
				"Specify the action to perform when the associated traffic, identity, and device posture expressions either absent or evaluate to `true`.",
			choices: [
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
			],
		})
		.coerce("action", (value) => resolveFileToken(value, "action", "text"))
		.option("description", {
			type: "string",
			description: "Specify the rule description.",
		})
		.option("device-posture", {
			type: "string",
			description:
				"Specify the wirefilter expression used for device posture check. The API automatically formats and sanitizes expressions before storing them. To prevent Terraform state drift, use the formatted expression returned in the API response.",
			default: "",
		})
		.option("enabled", {
			type: "boolean",
			description: "Specify whether the rule is enabled.",
			default: false,
		})
		.option("expiration-duration", {
			type: "number",
			description:
				"Defines the default duration a policy active in minutes. Must set in order to use the `reset_expiration` endpoint on this rule.",
		})
		.option("filters", {
			type: "string",
			array: true,
			description:
				"Specify the protocol or layer to evaluate the traffic, identity, and device posture expressions. Can only contain a single value.",
		})
		.option("identity", {
			type: "string",
			description:
				"Specify the wirefilter expression used for identity matching. The API automatically formats and sanitizes expressions before storing them. To prevent Terraform state drift, use the formatted expression returned in the API response.",
			default: "",
		})
		.option("name", { type: "string", description: "Specify the rule name." })
		.option("precedence", {
			type: "number",
			description:
				"Set the order of your rules. Lower values indicate higher precedence. At each processing phase, evaluate applicable rules in ascending order of this value. Refer to [Order of enforcement](http://developers.cloudflare.com/learning-paths/secure-internet-traffic/understand-policies/order-of-enforcement/#manage-precedence-with-terraform) to manage precedence via Terraform.",
		})
		.option("rule-settings-allow-child-bypass", {
			type: "boolean",
			description:
				"Set to enable MSP children to bypass this rule. Only parent MSP accounts can set this. this rule. Settable for all types of rules.",
		})
		.option("rule-settings-audit-ssh-command-logging", {
			type: "boolean",
			description: "Enable SSH command logging.",
		})
		.option("rule-settings-biso-admin-controls-copy", {
			type: "string",
			description:
				'Configure copy behavior. If set to remote_only, users cannot copy isolated content from the remote browser to the local clipboard. If this field is absent, copying remains enabled. Applies only when version == "v2".',
			choices: ["enabled", "disabled", "remote_only"],
		})
		.coerce("rule-settings-biso-admin-controls-copy", (value) =>
			resolveFileToken(value, "rule-settings-biso-admin-controls-copy", "text")
		)
		.option("rule-settings-biso-admin-controls-dcp", {
			type: "boolean",
			description:
				'Set to false to enable copy-pasting. Only applies when `version == "v1"`.',
		})
		.option("rule-settings-biso-admin-controls-dd", {
			type: "boolean",
			description:
				'Set to false to enable downloading. Only applies when `version == "v1"`.',
		})
		.option("rule-settings-biso-admin-controls-dk", {
			type: "boolean",
			description:
				'Set to false to enable keyboard usage. Only applies when `version == "v1"`.',
		})
		.option("rule-settings-biso-admin-controls-download", {
			type: "string",
			description:
				'Configure download behavior. When set to remote_only, users can view downloads but cannot save them. If this field is absent, downloading remains enabled. Applies only when version == "v2".',
			choices: ["enabled", "disabled", "remote_only"],
		})
		.coerce("rule-settings-biso-admin-controls-download", (value) =>
			resolveFileToken(
				value,
				"rule-settings-biso-admin-controls-download",
				"text"
			)
		)
		.option("rule-settings-biso-admin-controls-dp", {
			type: "boolean",
			description:
				'Set to false to enable printing. Only applies when `version == "v1"`.',
		})
		.option("rule-settings-biso-admin-controls-du", {
			type: "boolean",
			description:
				'Set to false to enable uploading. Only applies when `version == "v1"`.',
		})
		.option("rule-settings-biso-admin-controls-keyboard", {
			type: "string",
			description:
				'Configure keyboard usage behavior. If this field is absent, keyboard usage remains enabled. Applies only when version == "v2".',
			choices: ["enabled", "disabled"],
		})
		.coerce("rule-settings-biso-admin-controls-keyboard", (value) =>
			resolveFileToken(
				value,
				"rule-settings-biso-admin-controls-keyboard",
				"text"
			)
		)
		.option("rule-settings-biso-admin-controls-paste", {
			type: "string",
			description:
				'Configure paste behavior. If set to remote_only, users cannot paste content from the local clipboard into isolated pages. If this field is absent, pasting remains enabled. Applies only when version == "v2".',
			choices: ["enabled", "disabled", "remote_only"],
		})
		.coerce("rule-settings-biso-admin-controls-paste", (value) =>
			resolveFileToken(value, "rule-settings-biso-admin-controls-paste", "text")
		)
		.option("rule-settings-biso-admin-controls-printing", {
			type: "string",
			description:
				'Configure print behavior. Default, Printing is enabled. Applies only when version == "v2".',
			choices: ["enabled", "disabled"],
		})
		.coerce("rule-settings-biso-admin-controls-printing", (value) =>
			resolveFileToken(
				value,
				"rule-settings-biso-admin-controls-printing",
				"text"
			)
		)
		.option("rule-settings-biso-admin-controls-upload", {
			type: "string",
			description:
				'Configure upload behavior. If this field is absent, uploading remains enabled. Applies only when version == "v2".',
			choices: ["enabled", "disabled"],
		})
		.coerce("rule-settings-biso-admin-controls-upload", (value) =>
			resolveFileToken(
				value,
				"rule-settings-biso-admin-controls-upload",
				"text"
			)
		)
		.option("rule-settings-biso-admin-controls-version", {
			type: "string",
			description:
				"Indicate which version of the browser isolation controls should apply.",
			choices: ["v1", "v2"],
		})
		.coerce("rule-settings-biso-admin-controls-version", (value) =>
			resolveFileToken(
				value,
				"rule-settings-biso-admin-controls-version",
				"text"
			)
		)
		.option("rule-settings-biso-admin-controls-wm-id", {
			type: "string",
			description:
				"Specify the watermark ID (UUID) to apply to the isolated browser session. When present, enables watermark rendering in the isolated browser.",
		})
		.option("rule-settings-block-page-include-context", {
			type: "boolean",
			description:
				"Specify whether to pass the context information as query parameters.",
		})
		.option("rule-settings-block-page-target-uri", {
			type: "string",
			description: "Specify the URI to which the user is redirected.",
		})
		.option("rule-settings-block-page-enabled", {
			type: "boolean",
			description:
				"Enable the custom block page. Settable only for `dns` rules with action `block`.",
		})
		.option("rule-settings-block-reason", {
			type: "string",
			description:
				"Explain why the rule blocks the request. The custom block page shows this text (if enabled). Settable only for `dns`, `l4`, and `http` rules when the action set to `block`.",
		})
		.option("rule-settings-bypass-parent-rule", {
			type: "boolean",
			description:
				"Set to enable MSP accounts to bypass their parent's rules. Only MSP child accounts can set this. Settable for all types of rules.",
		})
		.option("rule-settings-check-session-duration", {
			type: "string",
			description:
				"Sets the required session freshness threshold. The API returns a normalized version of this value.",
		})
		.option("rule-settings-check-session-enforce", {
			type: "boolean",
			description: "Enable session enforcement.",
		})
		.option("rule-settings-delete-headers", {
			type: "string",
			array: true,
			description:
				"Remove headers from allowed requests by name. A maximum of 20 header operations (add + set + delete) is allowed per policy. Each header name may not exceed 256 bytes. Settable only for `http` rules with the action set to `allow`.",
		})
		.option("rule-settings-egress-ipv4", {
			type: "string",
			description: "Specify the IPv4 address to use for egress.",
		})
		.option("rule-settings-egress-ipv4-fallback", {
			type: "string",
			description:
				"Specify the fallback IPv4 address to use for egress when the primary IPv4 fails. Set '0.0.0.0' to indicate local egress via WARP IPs.",
		})
		.option("rule-settings-egress-ipv6", {
			type: "string",
			description: "Specify the IPv6 range to use for egress.",
		})
		.option("rule-settings-forensic-copy-enabled", {
			type: "boolean",
			description: "Enable sending the copy to storage.",
		})
		.option("rule-settings-ignore-cname-category-matches", {
			type: "boolean",
			description:
				"Ignore category matches at CNAME domains in a response. When off, evaluate categories in this rule against all CNAME domain categories in the response. Settable only for `dns` and `dns_resolver` rules.",
		})
		.option("rule-settings-insecure-disable-dnssec-validation", {
			type: "boolean",
			description:
				"Specify whether to disable DNSSEC validation (for Allow actions) [INSECURE]. Settable only for `dns` rules.",
		})
		.option("rule-settings-ip-categories", {
			type: "boolean",
			description:
				"Enable IPs in DNS resolver category blocks. The system blocks only domain name categories unless you enable this setting. Settable only for `dns` and `dns_resolver` rules.",
		})
		.option("rule-settings-ip-indicator-feeds", {
			type: "boolean",
			description:
				"Indicates whether to include IPs in DNS resolver indicator feed blocks. Default, indicator feeds block only domain names. Settable only for `dns` and `dns_resolver` rules.",
		})
		.option("rule-settings-l4override-ip", {
			type: "string",
			description: "Defines the IPv4 or IPv6 address.",
		})
		.option("rule-settings-l4override-port", {
			type: "number",
			description: "Defines a port number to use for TCP/UDP overrides.",
		})
		.option("rule-settings-notification-settings-enabled", {
			type: "boolean",
			description: "Enable notification.",
		})
		.option("rule-settings-notification-settings-include-context", {
			type: "boolean",
			description:
				"Indicates whether to pass the context information as query parameters.",
		})
		.option("rule-settings-notification-settings-msg", {
			type: "string",
			description: "Customize the message shown in the notification.",
		})
		.option("rule-settings-notification-settings-support-url", {
			type: "string",
			description:
				"Defines an optional URL to direct users to additional information. If unset, the notification opens a block page.",
		})
		.option("rule-settings-override-host", {
			type: "string",
			description:
				"Defines a hostname for override, for the matching DNS queries. Settable only for `dns` rules with the action set to `override`.",
		})
		.option("rule-settings-override-ips", {
			type: "string",
			array: true,
			description:
				"Defines a an IP or set of IPs for overriding matched DNS queries. Settable only for `dns` rules with the action set to `override`.",
		})
		.option("rule-settings-payload-log-enabled", {
			type: "boolean",
			description: "Enable DLP payload logging for this rule.",
		})
		.option("rule-settings-quarantine-file-types", {
			type: "string",
			array: true,
			description: "Specify the types of files to sandbox.",
		})
		.option("rule-settings-redirect-include-context", {
			type: "boolean",
			description:
				"Specify whether to pass the context information as query parameters.",
		})
		.option("rule-settings-redirect-preserve-path-and-query", {
			type: "boolean",
			description:
				"Specify whether to append the path and query parameters from the original request to target_uri.",
		})
		.option("rule-settings-redirect-target-uri", {
			type: "string",
			description: "Specify the URI to which the user is redirected.",
		})
		.option("rule-settings-resolve-dns-internally-fallback", {
			type: "string",
			description:
				"Specify the fallback behavior to apply when the internal DNS response code differs from 'NOERROR' or when the response data contains only CNAME records for 'A' or 'AAAA' queries.",
			choices: ["none", "public_dns"],
		})
		.coerce("rule-settings-resolve-dns-internally-fallback", (value) =>
			resolveFileToken(
				value,
				"rule-settings-resolve-dns-internally-fallback",
				"text"
			)
		)
		.option("rule-settings-resolve-dns-internally-view-id", {
			type: "string",
			description:
				"Specify the internal DNS view identifier to pass to the internal DNS service.",
		})
		.option("rule-settings-resolve-dns-through-cloudflare", {
			type: "boolean",
			description:
				"Enable to send queries that match the policy to Cloudflare's default 1.1.1.1 DNS resolver. Cannot set when 'dns_resolvers' specified or 'resolve_dns_internally' is set. Only valid when a rule's action set to 'resolve'. Settable only for `dns_resolver` rules.",
		})
		.option("rule-settings-untrusted-cert-action", {
			type: "string",
			description:
				"Defines the action performed when an untrusted certificate seen. The default action an error with HTTP code 526.",
			choices: ["pass_through", "block", "error"],
		})
		.coerce("rule-settings-untrusted-cert-action", (value) =>
			resolveFileToken(value, "rule-settings-untrusted-cert-action", "text")
		)
		.option("schedule-fri", {
			type: "string",
			description:
				"Specify the time intervals when the rule is active on Fridays, in the increasing order from 00:00-24:00.  If this parameter omitted, the rule is deactivated on Fridays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
		})
		.option("schedule-mon", {
			type: "string",
			description:
				"Specify the time intervals when the rule is active on Mondays, in the increasing order from 00:00-24:00(capped at maximum of 6 time splits). If this parameter omitted, the rule is deactivated on Mondays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
		})
		.option("schedule-sat", {
			type: "string",
			description:
				"Specify the time intervals when the rule is active on Saturdays, in the increasing order from 00:00-24:00.  If this parameter omitted, the rule is deactivated on Saturdays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
		})
		.option("schedule-sun", {
			type: "string",
			description:
				"Specify the time intervals when the rule is active on Sundays, in the increasing order from 00:00-24:00. If this parameter omitted, the rule is deactivated on Sundays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
		})
		.option("schedule-thu", {
			type: "string",
			description:
				"Specify the time intervals when the rule is active on Thursdays, in the increasing order from 00:00-24:00. If this parameter omitted, the rule is deactivated on Thursdays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
		})
		.option("schedule-time-zone", {
			type: "string",
			description:
				"Specify the time zone for rule evaluation. When a [valid time zone city name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List) is provided, Gateway always uses the current time for that time zone. When this parameter is omitted, Gateway uses the time zone determined from the user's IP address. Colo time zone is used when the user's IP address does not resolve to a location.",
		})
		.option("schedule-tue", {
			type: "string",
			description:
				"Specify the time intervals when the rule is active on Tuesdays, in the increasing order from 00:00-24:00. If this parameter omitted, the rule is deactivated on Tuesdays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
		})
		.option("schedule-wed", {
			type: "string",
			description:
				"Specify the time intervals when the rule is active on Wednesdays, in the increasing order from 00:00-24:00. If this parameter omitted, the rule is deactivated on Wednesdays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
		})
		.option("traffic", {
			type: "string",
			description:
				"Specify the wirefilter expression used for traffic matching. The API automatically formats and sanitizes expressions before storing them. To prevent Terraform state drift, use the formatted expression returned in the API response.",
			default: "",
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
				"rule-settings-allow-child-bypass",
				"rule-settings-audit-ssh-command-logging",
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
				"rule-settings-biso-admin-controls-wm-id",
				"rule-settings-block-page-include-context",
				"rule-settings-block-page-target-uri",
				"rule-settings-block-page-enabled",
				"rule-settings-block-reason",
				"rule-settings-bypass-parent-rule",
				"rule-settings-check-session-duration",
				"rule-settings-check-session-enforce",
				"rule-settings-delete-headers",
				"rule-settings-egress-ipv4",
				"rule-settings-egress-ipv4-fallback",
				"rule-settings-egress-ipv6",
				"rule-settings-forensic-copy-enabled",
				"rule-settings-ignore-cname-category-matches",
				"rule-settings-insecure-disable-dnssec-validation",
				"rule-settings-ip-categories",
				"rule-settings-ip-indicator-feeds",
				"rule-settings-l4override-ip",
				"rule-settings-l4override-port",
				"rule-settings-notification-settings-enabled",
				"rule-settings-notification-settings-include-context",
				"rule-settings-notification-settings-msg",
				"rule-settings-notification-settings-support-url",
				"rule-settings-override-host",
				"rule-settings-override-ips",
				"rule-settings-payload-log-enabled",
				"rule-settings-quarantine-file-types",
				"rule-settings-redirect-include-context",
				"rule-settings-redirect-preserve-path-and-query",
				"rule-settings-redirect-target-uri",
				"rule-settings-resolve-dns-internally-fallback",
				"rule-settings-resolve-dns-internally-view-id",
				"rule-settings-resolve-dns-through-cloudflare",
				"rule-settings-untrusted-cert-action",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"rule-settings-block-page-target-uri",
					"rule-settings-redirect-target-uri",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --rule_settings-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"zero-trust-gateway-rules-create-zero-trust-gateway-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a Zero Trust Gateway rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway rules create",
				classification: {
					safeFlags: [
						"action",
						"enabled",
						"rule-settings-allow-child-bypass",
						"rule-settings-audit-ssh-command-logging",
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust gateway rules create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/rules`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
											allow_child_bypass:
												argv["rule-settings-allow-child-bypass"],
											audit_ssh: {
												command_logging:
													argv["rule-settings-audit-ssh-command-logging"],
											},
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
						client.zeroTrust.gateway.rules.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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
						] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Specify the rule name."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						allow_child_bypass: argv["rule-settings-allow-child-bypass"],
						audit_ssh: {
							command_logging: argv["rule-settings-audit-ssh-command-logging"],
						},
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.gateway.rules.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
