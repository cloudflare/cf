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
		action: {
			kind: "parsed",
			brief:
				"Specify the action to perform when the associated traffic, identity, and device posture expressions either absent or evaluate to `true`.",
			optional: true,
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
				"forward",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Specify the rule description.",
			default: "",
			parse: String,
		},
		"device-posture": {
			kind: "parsed",
			brief:
				"Specify the wirefilter expression used for device posture check. The API automatically formats and sanitizes expressions before storing them. To prevent Terraform state drift, use the formatted expression returned in the API response.",
			default: "",
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Specify whether the rule is enabled.",
			default: false,
		},
		"expiration-duration": {
			kind: "parsed",
			brief:
				"Defines the default duration a policy active in minutes. Must set in order to use the `reset_expiration` endpoint on this rule.",
			optional: true,
			parse: Number,
		},
		"expiration-expires-at": {
			kind: "parsed",
			brief: "The expiration.expires_at field",
			optional: true,
			parse: String,
		},
		filters: {
			kind: "parsed",
			brief:
				"Specify the protocol or layer to evaluate the traffic, identity, and device posture expressions. Can only contain a single value.",
			variadic: true,
			optional: true,
			parse: String,
		},
		identity: {
			kind: "parsed",
			brief:
				"Specify the wirefilter expression used for identity matching. The API automatically formats and sanitizes expressions before storing them. To prevent Terraform state drift, use the formatted expression returned in the API response.",
			default: "",
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Specify the rule name.",
			optional: true,
			parse: String,
		},
		precedence: {
			kind: "parsed",
			brief:
				"Set the order of your rules. Lower values indicate higher precedence. At each processing phase, evaluate applicable rules in ascending order of this value. Refer to [Order of enforcement](http://developers.cloudflare.com/learning-paths/secure-internet-traffic/understand-policies/order-of-enforcement/#manage-precedence-with-terraform) to manage precedence via Terraform.",
			optional: true,
			parse: Number,
		},
		"rule-settings-add-headers": {
			kind: "parsed",
			brief:
				'Add custom headers to allowed requests as key-value pairs. Use header names as keys that map to arrays of header values. Header values may contain `@{selector.name}` variable references that are interpolated at the edge. Use `@@{` to escape a literal `@{`. A maximum of 20 header operations (add + set + delete) is allowed per policy. Each header name may not exceed 256 bytes and each header value may not exceed 4 KB. Settable only for `http` rules with the action set to `allow`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		"rule-settings-allow-child-bypass": {
			kind: "boolean",
			brief:
				"Set to enable MSP children to bypass this rule. Only parent MSP accounts can set this. this rule. Settable for all types of rules.",
			optional: true,
		},
		"rule-settings-biso-admin-controls-copy": {
			kind: "parsed",
			brief:
				'Configure copy behavior. If set to remote_only, users cannot copy isolated content from the remote browser to the local clipboard. If this field is absent, copying remains enabled. Applies only when version == "v2".',
			optional: true,
			choices: ["enabled", "disabled", "remote_only"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"rule-settings-biso-admin-controls-copy",
					"text"
				),
		},
		"rule-settings-biso-admin-controls-dcp": {
			kind: "boolean",
			brief:
				'Set to false to enable copy-pasting. Only applies when `version == "v1"`.',
			optional: true,
		},
		"rule-settings-biso-admin-controls-dd": {
			kind: "boolean",
			brief:
				'Set to false to enable downloading. Only applies when `version == "v1"`.',
			optional: true,
		},
		"rule-settings-biso-admin-controls-dk": {
			kind: "boolean",
			brief:
				'Set to false to enable keyboard usage. Only applies when `version == "v1"`.',
			optional: true,
		},
		"rule-settings-biso-admin-controls-download": {
			kind: "parsed",
			brief:
				'Configure download behavior. When set to remote_only, users can view downloads but cannot save them. If this field is absent, downloading remains enabled. Applies only when version == "v2".',
			optional: true,
			choices: ["enabled", "disabled", "remote_only"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"rule-settings-biso-admin-controls-download",
					"text"
				),
		},
		"rule-settings-biso-admin-controls-dp": {
			kind: "boolean",
			brief:
				'Set to false to enable printing. Only applies when `version == "v1"`.',
			optional: true,
		},
		"rule-settings-biso-admin-controls-du": {
			kind: "boolean",
			brief:
				'Set to false to enable uploading. Only applies when `version == "v1"`.',
			optional: true,
		},
		"rule-settings-biso-admin-controls-keyboard": {
			kind: "parsed",
			brief:
				'Configure keyboard usage behavior. When set to enable_read_only_actions, only approved browser commands (find, copy, print, zoom, and select-all) may execute; other keyboard input is blocked from reaching the page. Copy and print remain subject to their independent controls. If this field is absent, keyboard usage remains enabled. Applies only when version == "v2". The enable_read_only_actions value requires an explicit version of "v2".',
			optional: true,
			choices: ["enabled", "disabled", "enable_read_only_actions"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"rule-settings-biso-admin-controls-keyboard",
					"text"
				),
		},
		"rule-settings-biso-admin-controls-paste": {
			kind: "parsed",
			brief:
				'Configure paste behavior. If set to remote_only, users cannot paste content from the local clipboard into isolated pages. If this field is absent, pasting remains enabled. Applies only when version == "v2".',
			optional: true,
			choices: ["enabled", "disabled", "remote_only"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"rule-settings-biso-admin-controls-paste",
					"text"
				),
		},
		"rule-settings-biso-admin-controls-printing": {
			kind: "parsed",
			brief:
				'Configure print behavior. Default, Printing is enabled. Applies only when version == "v2".',
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"rule-settings-biso-admin-controls-printing",
					"text"
				),
		},
		"rule-settings-biso-admin-controls-upload": {
			kind: "parsed",
			brief:
				'Configure upload behavior. If this field is absent, uploading remains enabled. Applies only when version == "v2".',
			optional: true,
			choices: ["enabled", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"rule-settings-biso-admin-controls-upload",
					"text"
				),
		},
		"rule-settings-biso-admin-controls-version": {
			kind: "parsed",
			brief:
				"Indicate which version of the browser isolation controls should apply.",
			optional: true,
			choices: ["v1", "v2"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"rule-settings-biso-admin-controls-version",
					"text"
				),
		},
		"rule-settings-biso-admin-controls-wm-id": {
			kind: "parsed",
			brief:
				"Specify the watermark ID (UUID) to apply to the isolated browser session. When present, enables watermark rendering in the isolated browser.",
			optional: true,
			parse: String,
		},
		"rule-settings-block-page-include-context": {
			kind: "boolean",
			brief:
				"Specify whether to pass the context information as query parameters.",
			optional: true,
		},
		"rule-settings-block-page-target-uri": {
			kind: "parsed",
			brief: "Specify the URI to which the user is redirected.",
			optional: true,
			parse: String,
		},
		"rule-settings-block-page-enabled": {
			kind: "boolean",
			brief:
				"Enable the custom block page. Settable only for `dns` rules with action `block`.",
			optional: true,
		},
		"rule-settings-block-reason": {
			kind: "parsed",
			brief:
				"Explain why the rule blocks the request. The custom block page shows this text (if enabled). Settable only for `dns`, `l4`, and `http` rules when the action set to `block`.",
			optional: true,
			parse: String,
		},
		"rule-settings-bypass-parent-rule": {
			kind: "boolean",
			brief:
				"Set to enable MSP accounts to bypass their parent's rules. Only MSP child accounts can set this. Settable for all types of rules.",
			optional: true,
		},
		"rule-settings-check-session-duration": {
			kind: "parsed",
			brief:
				"Sets the required session freshness threshold. The API returns a normalized version of this value.",
			optional: true,
			parse: String,
		},
		"rule-settings-check-session-enforce": {
			kind: "boolean",
			brief: "Enable session enforcement.",
			optional: true,
		},
		"rule-settings-delete-headers": {
			kind: "parsed",
			brief:
				"Remove headers from allowed requests by name. A maximum of 20 header operations (add + set + delete) is allowed per policy. Each header name may not exceed 256 bytes. Settable only for `http` rules with the action set to `allow`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"rule-settings-dns-resolvers-ipv4": {
			kind: "parsed",
			brief:
				'The rule_settings.dns_resolvers.ipv4 field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"ip": string, "port"?: number, "route_through_private_network"?: boolean, "vnet_id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"rule-settings-dns-resolvers-ipv6": {
			kind: "parsed",
			brief:
				'The rule_settings.dns_resolvers.ipv6 field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"ip": string, "port"?: number, "route_through_private_network"?: boolean, "vnet_id"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"rule-settings-egress-ipv4": {
			kind: "parsed",
			brief: "Specify the IPv4 address to use for egress.",
			optional: true,
			parse: String,
		},
		"rule-settings-egress-ipv4-fallback": {
			kind: "parsed",
			brief:
				"Specify the fallback IPv4 address to use for egress when the primary IPv4 fails. Set '0.0.0.0' to indicate local egress via WARP IPs.",
			optional: true,
			parse: String,
		},
		"rule-settings-egress-ipv6": {
			kind: "parsed",
			brief: "Specify the IPv6 range to use for egress.",
			optional: true,
			parse: String,
		},
		"rule-settings-forensic-copy-enabled": {
			kind: "boolean",
			brief: "Enable sending the copy to storage.",
			optional: true,
		},
		"rule-settings-forward-worker-id": {
			kind: "parsed",
			brief: "Specify the public Worker ID of the target Worker.",
			optional: true,
			parse: String,
		},
		"rule-settings-ignore-cname-category-matches": {
			kind: "boolean",
			brief:
				"Ignore category matches at CNAME domains in a response. When off, evaluate categories in this rule against all CNAME domain categories in the response. Settable only for `dns` and `dns_resolver` rules.",
			optional: true,
		},
		"rule-settings-insecure-disable-dnssec-validation": {
			kind: "boolean",
			brief:
				"Specify whether to disable DNSSEC validation (for Allow actions) [INSECURE]. Settable only for `dns` rules.",
			optional: true,
		},
		"rule-settings-ip-categories": {
			kind: "boolean",
			brief:
				"Enable IPs in DNS resolver category blocks. The system blocks only domain name categories unless you enable this setting. Settable only for `dns` and `dns_resolver` rules.",
			optional: true,
		},
		"rule-settings-ip-indicator-feeds": {
			kind: "boolean",
			brief:
				"Indicates whether to include IPs in DNS resolver indicator feed blocks. Default, indicator feeds block only domain names. Settable only for `dns` and `dns_resolver` rules.",
			optional: true,
		},
		"rule-settings-l4override-ip": {
			kind: "parsed",
			brief: "Defines the IPv4 or IPv6 address.",
			optional: true,
			parse: String,
		},
		"rule-settings-l4override-port": {
			kind: "parsed",
			brief: "Defines a port number to use for TCP/UDP overrides.",
			optional: true,
			parse: Number,
		},
		"rule-settings-notification-settings-enabled": {
			kind: "boolean",
			brief: "Enable notification.",
			optional: true,
		},
		"rule-settings-notification-settings-include-context": {
			kind: "boolean",
			brief:
				"Indicates whether to pass the context information as query parameters.",
			optional: true,
		},
		"rule-settings-notification-settings-msg": {
			kind: "parsed",
			brief: "Customize the message shown in the notification.",
			optional: true,
			parse: String,
		},
		"rule-settings-notification-settings-support-url": {
			kind: "parsed",
			brief:
				"Defines an optional URL to direct users to additional information. If unset, the notification opens a block page.",
			optional: true,
			parse: String,
		},
		"rule-settings-override-host": {
			kind: "parsed",
			brief:
				"Defines a hostname for override, for the matching DNS queries. Settable only for `dns` rules with the action set to `override`.",
			optional: true,
			parse: String,
		},
		"rule-settings-override-ips": {
			kind: "parsed",
			brief:
				"Defines a an IP or set of IPs for overriding matched DNS queries. Settable only for `dns` rules with the action set to `override`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"rule-settings-payload-log-enabled": {
			kind: "boolean",
			brief: "Enable DLP payload logging for this rule.",
			optional: true,
		},
		"rule-settings-quarantine-file-types": {
			kind: "parsed",
			brief: "Specify the types of files to sandbox.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"rule-settings-redirect-include-context": {
			kind: "boolean",
			brief:
				"Specify whether to pass the context information as query parameters.",
			optional: true,
		},
		"rule-settings-redirect-preserve-path-and-query": {
			kind: "boolean",
			brief:
				"Specify whether to append the path and query parameters from the original request to target_uri.",
			optional: true,
		},
		"rule-settings-redirect-target-uri": {
			kind: "parsed",
			brief: "Specify the URI to which the user is redirected.",
			optional: true,
			parse: String,
		},
		"rule-settings-resolve-dns-internally-fallback": {
			kind: "parsed",
			brief:
				"Specify the fallback behavior to apply when the internal DNS response code differs from 'NOERROR' or when the response data contains only CNAME records for 'A' or 'AAAA' queries.",
			optional: true,
			choices: ["none", "public_dns"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"rule-settings-resolve-dns-internally-fallback",
					"text"
				),
		},
		"rule-settings-resolve-dns-internally-view-id": {
			kind: "parsed",
			brief:
				"Specify the internal DNS view identifier to pass to the internal DNS service.",
			optional: true,
			parse: String,
		},
		"rule-settings-resolve-dns-through-cloudflare": {
			kind: "boolean",
			brief:
				"Enable to send queries that match the policy to Cloudflare's default 1.1.1.1 DNS resolver. Cannot set when 'dns_resolvers' specified or 'resolve_dns_internally' is set. Only valid when a rule's action set to 'resolve'. Settable only for `dns_resolver` rules.",
			optional: true,
		},
		"rule-settings-set-headers": {
			kind: "parsed",
			brief:
				'Replace existing headers on allowed requests with the specified key-value pairs. If a header does not exist, it is added. Header values may contain `@{selector.name}` variable references that are interpolated at the edge. Use `@@{` to escape a literal `@{`. A maximum of 20 header operations (add + set + delete) is allowed per policy. Each header name may not exceed 256 bytes and each header value may not exceed 4 KB. Settable only for `http` rules with the action set to `allow`. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		"rule-settings-untrusted-cert-action": {
			kind: "parsed",
			brief:
				"Defines the action performed when an untrusted certificate seen. The default action an error with HTTP code 526.",
			optional: true,
			choices: ["pass_through", "block", "error"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "rule-settings-untrusted-cert-action", "text"),
		},
		"schedule-fri": {
			kind: "parsed",
			brief:
				"Specify the time intervals when the rule is active on Fridays, in the increasing order from 00:00-24:00.  If this parameter omitted, the rule is deactivated on Fridays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
			optional: true,
			parse: String,
		},
		"schedule-mon": {
			kind: "parsed",
			brief:
				"Specify the time intervals when the rule is active on Mondays, in the increasing order from 00:00-24:00(capped at maximum of 6 time splits). If this parameter omitted, the rule is deactivated on Mondays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
			optional: true,
			parse: String,
		},
		"schedule-sat": {
			kind: "parsed",
			brief:
				"Specify the time intervals when the rule is active on Saturdays, in the increasing order from 00:00-24:00.  If this parameter omitted, the rule is deactivated on Saturdays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
			optional: true,
			parse: String,
		},
		"schedule-sun": {
			kind: "parsed",
			brief:
				"Specify the time intervals when the rule is active on Sundays, in the increasing order from 00:00-24:00. If this parameter omitted, the rule is deactivated on Sundays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
			optional: true,
			parse: String,
		},
		"schedule-thu": {
			kind: "parsed",
			brief:
				"Specify the time intervals when the rule is active on Thursdays, in the increasing order from 00:00-24:00. If this parameter omitted, the rule is deactivated on Thursdays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
			optional: true,
			parse: String,
		},
		"schedule-time-zone": {
			kind: "parsed",
			brief:
				"Specify the time zone for rule evaluation. When a [valid time zone city name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List) is provided, Gateway always uses the current time for that time zone. When this parameter is omitted, Gateway uses the time zone determined from the user's IP address. Colo time zone is used when the user's IP address does not resolve to a location.",
			optional: true,
			parse: String,
		},
		"schedule-tue": {
			kind: "parsed",
			brief:
				"Specify the time intervals when the rule is active on Tuesdays, in the increasing order from 00:00-24:00. If this parameter omitted, the rule is deactivated on Tuesdays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
			optional: true,
			parse: String,
		},
		"schedule-wed": {
			kind: "parsed",
			brief:
				"Specify the time intervals when the rule is active on Wednesdays, in the increasing order from 00:00-24:00. If this parameter omitted, the rule is deactivated on Wednesdays. API returns a formatted version of this string, which may cause Terraform drift if a unformatted value is used.",
			optional: true,
			parse: String,
		},
		traffic: {
			kind: "parsed",
			brief:
				"Specify the wirefilter expression used for traffic matching. The API automatically formats and sanitizes expressions before storing them. To prevent Terraform state drift, use the formatted expression returned in the API response.",
			default: "",
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
			const groupSet = ["expiration-duration", "expiration-expires-at"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["expiration-expires-at"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --expiration-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"rule-settings-block-page-include-context",
				"rule-settings-block-page-target-uri",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["rule-settings-block-page-target-uri"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --rule-settings-block-page-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"rule-settings-redirect-include-context",
				"rule-settings-redirect-preserve-path-and-query",
				"rule-settings-redirect-target-uri",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["rule-settings-redirect-target-uri"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --rule-settings-redirect-* flag is set`
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
	describe: "Create a Zero Trust Gateway rule",
	usage:
		"$0 zero-trust gateway rules create\n\nCreate a new Zero Trust Gateway rule.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
