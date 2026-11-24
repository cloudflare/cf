/**
 * create command
 * @generated from apis/overlays/logpush.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		dataset: {
			kind: "parsed",
			brief:
				"Name of the dataset. A list of supported datasets can be found on the [Developer Docs](https://developers.cloudflare.com/logs/reference/log-fields/).",
			default: "http_requests",
			choices: [
				"access_requests",
				"account_abuse_protection_events",
				"ai_gateway_events",
				"audit_logs",
				"audit_logs_v2",
				"biso_user_actions",
				"casb_findings",
				"device_posture_results",
				"dex_application_tests",
				"dex_device_state_events",
				"dlp_forensic_copies",
				"dns_firewall_logs",
				"dns_logs",
				"email_security_alerts",
				"email_security_post_delivery_events",
				"firewall_events",
				"gateway_dns",
				"gateway_http",
				"gateway_network",
				"http_requests",
				"ipsec_logs",
				"magic_bgp_logs",
				"magic_ids_detections",
				"mcp_portal_logs",
				"mnm_flow_logs",
				"nel_reports",
				"network_analytics_logs",
				"page_shield_events",
				"sinkhole_http_logs",
				"spectrum_events",
				"ssh_logs",
				"turnstile_events",
				"warp_config_changes",
				"warp_toggle_changes",
				"websocket_analytics",
				"workers_trace_events",
				"zaraz_events",
				"zero_trust_network_sessions",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "dataset", "text"),
		},
		"destination-conf": {
			kind: "parsed",
			brief:
				"Uniquely identifies a resource (such as an s3 bucket) where data. will be pushed. Additional configuration parameters supported by the destination may be included.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Flag that indicates if the job is enabled.",
			default: false,
		},
		filter: {
			kind: "parsed",
			brief:
				"The filters to select the events to include and/or remove from your logs. For more information, refer to [Filters](https://developers.cloudflare.com/logs/reference/filters/).",
			optional: true,
			parse: String,
		},
		"filter-attack-traffic": {
			kind: "boolean",
			brief:
				"When true, excludes DDoS attack traffic from logs. This option is supported for the `http_requests`, `firewall_events`, and `network_analytics_logs` datasets.",
			default: false,
		},
		frequency: {
			kind: "parsed",
			brief:
				"This field is deprecated. Please use `max_upload_*` parameters instead. . The frequency at which Cloudflare sends batches of logs to your destination. Setting frequency to high sends your logs in larger quantities of smaller files. Setting frequency to low sends logs in smaller quantities of larger files.",
			default: "high",
			choices: ["high", "low"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "frequency", "text"),
		},
		kind: {
			kind: "parsed",
			brief:
				"The kind parameter (optional) is used to differentiate between Logpush and Edge Log Delivery jobs (when supported by the dataset).",
			default: "",
			choices: ["edge"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "kind", "text"),
		},
		"logpull-options": {
			kind: "parsed",
			brief:
				"This field is deprecated. Use `output_options` instead. Configuration string. It specifies things like requested fields and timestamp formats. If migrating from the logpull api, copy the url (full url or just the query string) of your call here, and logpush will keep on making this call for you, setting start and end times appropriately.",
			optional: true,
			parse: String,
		},
		"max-upload-bytes": {
			kind: "parsed",
			brief:
				"The maximum uncompressed file size of a batch of logs. This setting value must be between `5 MB` and `1 GB`, or `0` to disable it. Note that you cannot set a minimum file size; this means that log files may be much smaller than this batch size.",
			optional: true,
			parse: Number,
		},
		"max-upload-interval-seconds": {
			kind: "parsed",
			brief:
				"The maximum interval in seconds for log batches. This setting must be between 30 and 300 seconds (5 minutes), or `0` to disable it. Note that you cannot specify a minimum interval for log batches; this means that log files may be sent in shorter intervals than this.",
			optional: true,
			parse: Number,
		},
		"max-upload-records": {
			kind: "parsed",
			brief:
				"The maximum number of log lines per batch. This setting must be between 1000 and 1,000,000 lines, or `0` to disable it. Note that you cannot specify a minimum number of log lines per batch; this means that log files may contain many fewer lines than this.",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"Optional human readable job name. Not unique. Cloudflare suggests. that you set this to a meaningful string, like the domain name, to make it easier to identify your job.",
			optional: true,
			parse: String,
		},
		"output-options-cve-2021-44228": {
			kind: "boolean",
			brief:
				"If set to true, will cause all occurrences of `${` in the generated files to be replaced with `x{`.",
			optional: true,
		},
		"output-options-batch-prefix": {
			kind: "parsed",
			brief: "String to be prepended before each batch.",
			optional: true,
			parse: String,
		},
		"output-options-batch-suffix": {
			kind: "parsed",
			brief: "String to be appended after each batch.",
			optional: true,
			parse: String,
		},
		"output-options-field-delimiter": {
			kind: "parsed",
			brief:
				"String to join fields. This field be ignored when `record_template` is set.",
			optional: true,
			parse: String,
		},
		"output-options-field-names": {
			kind: "parsed",
			brief:
				"List of field names to be included in the Logpush output. For the moment, there is no option to add all fields at once, so you must specify all the fields names you are interested in.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"output-options-merge-subrequests": {
			kind: "boolean",
			brief:
				"If set to true, subrequests will be merged into the parent request. Only supported for the `http_requests` dataset.",
			optional: true,
		},
		"output-options-output-type": {
			kind: "parsed",
			brief:
				"Specifies the output type, such as `ndjson` or `csv`. This sets default values for the rest of the settings, depending on the chosen output type. Some formatting rules, like string quoting, are different between output types.",
			optional: true,
			choices: ["ndjson", "csv"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "output-options-output-type", "text"),
		},
		"output-options-record-delimiter": {
			kind: "parsed",
			brief: "String to be inserted in-between the records as separator.",
			optional: true,
			parse: String,
		},
		"output-options-record-prefix": {
			kind: "parsed",
			brief: "String to be prepended before each record.",
			optional: true,
			parse: String,
		},
		"output-options-record-suffix": {
			kind: "parsed",
			brief: "String to be appended after each record.",
			optional: true,
			parse: String,
		},
		"output-options-record-template": {
			kind: "parsed",
			brief:
				"String to use as template for each record instead of the default json key value mapping. All fields used in the template must be present in `field_names` as well, otherwise they will end up as null. Format as a Go `text/template` without any standard functions, like conditionals, loops, sub-templates, etc.",
			optional: true,
			parse: String,
		},
		"output-options-sample-rate": {
			kind: "parsed",
			brief:
				"Specifies the sampling rate as a floating number greater than 0 and at most 1. Sampling is applied on top of filtering, and regardless of the current `sample_interval` of the data.",
			optional: true,
			parse: Number,
		},
		"output-options-timestamp-format": {
			kind: "parsed",
			brief:
				"String to specify the format for timestamps, such as `unixnano`, `unix`, `rfc3339`, `rfc3339ms` or `rfc3339ns`.",
			optional: true,
			choices: ["unixnano", "unix", "rfc3339", "rfc3339ms", "rfc3339ns"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "output-options-timestamp-format", "text"),
		},
		"ownership-challenge": {
			kind: "parsed",
			brief: "Ownership challenge token to prove destination ownership.",
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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Logpush job",
	usage:
		"$0 logpush account-jobs create\n\nCreates a new Logpush job for an account or zone.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
