import operation from "../../_operations/logpush/account-jobs/update.js";
/**
 * update command
 * @generated from apis/overlays/logpush.ts
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
	command: "update <job-id>",
	describe: "Update Logpush job",
	usage:
		"$0 logpush account-jobs update <job-id>\n\nUpdates a Logpush job.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
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
			optional: true,
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
			optional: true,
		},
		frequency: {
			kind: "parsed",
			brief:
				"This field is deprecated. Please use `max_upload_*` parameters instead. . The frequency at which Cloudflare sends batches of logs to your destination. Setting frequency to high sends your logs in larger quantities of smaller files. Setting frequency to low sends logs in smaller quantities of larger files.",
			optional: true,
			choices: ["high", "low"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "frequency", "text"),
		},
		kind: {
			kind: "parsed",
			brief:
				"The kind parameter (optional) is used to differentiate between Logpush and Edge Log Delivery jobs (when supported by the dataset).",
			optional: true,
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
	operands: [
		{ placeholder: "job-id", brief: "Unique id of the job.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logpush account-jobs update",
				classification: {
					safeFlags: [
						"enabled",
						"filter-attack-traffic",
						"frequency",
						"kind",
						"output-options-cve-2021-44228",
						"output-options-merge-subrequests",
						"output-options-output-type",
						"output-options-timestamp-format",
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
						command: "cf logpush account-jobs update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/logpush/jobs/${argv["job-id"] == null ? "<job-id>" : encodeURIComponent(String(argv["job-id"]))}`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
							"job-id": String(argv["job-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destination_conf: resolveFileToken(
											argv["destination-conf"] as string | undefined,
											"destination-conf",
											"text"
										),
										enabled: argv["enabled"],
										filter: resolveFileToken(
											argv["filter"] as string | undefined,
											"filter",
											"text"
										),
										filter_attack_traffic: argv["filter-attack-traffic"],
										frequency: argv["frequency"],
										kind: argv["kind"],
										logpull_options: resolveFileToken(
											argv["logpull-options"] as string | undefined,
											"logpull-options",
											"text"
										),
										max_upload_bytes: argv["max-upload-bytes"],
										max_upload_interval_seconds:
											argv["max-upload-interval-seconds"],
										max_upload_records: argv["max-upload-records"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										output_options: {
											"CVE-2021-44228": argv["output-options-cve-2021-44228"],
											batch_prefix: resolveFileToken(
												argv["output-options-batch-prefix"] as
													| string
													| undefined,
												"output-options-batch-prefix",
												"text"
											),
											batch_suffix: resolveFileToken(
												argv["output-options-batch-suffix"] as
													| string
													| undefined,
												"output-options-batch-suffix",
												"text"
											),
											field_delimiter: resolveFileToken(
												argv["output-options-field-delimiter"] as
													| string
													| undefined,
												"output-options-field-delimiter",
												"text"
											),
											field_names: argv["output-options-field-names"],
											merge_subrequests:
												argv["output-options-merge-subrequests"],
											output_type: argv["output-options-output-type"],
											record_delimiter: resolveFileToken(
												argv["output-options-record-delimiter"] as
													| string
													| undefined,
												"output-options-record-delimiter",
												"text"
											),
											record_prefix: resolveFileToken(
												argv["output-options-record-prefix"] as
													| string
													| undefined,
												"output-options-record-prefix",
												"text"
											),
											record_suffix: resolveFileToken(
												argv["output-options-record-suffix"] as
													| string
													| undefined,
												"output-options-record-suffix",
												"text"
											),
											record_template: resolveFileToken(
												argv["output-options-record-template"] as
													| string
													| undefined,
												"output-options-record-template",
												"text"
											),
											sample_rate: argv["output-options-sample-rate"],
											timestamp_format: argv["output-options-timestamp-format"],
										},
										ownership_challenge: resolveFileToken(
											argv["ownership-challenge"] as string | undefined,
											"ownership-challenge",
											"text"
										),
									}),
						sensitiveBodyPaths: [["destination_conf"], ["ownership_challenge"]],
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
							job_id: argv["job-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					destination_conf: resolveFileToken(
						argv["destination-conf"] as string | undefined,
						"destination-conf",
						"text"
					),
					enabled: argv["enabled"],
					filter: resolveFileToken(
						argv["filter"] as string | undefined,
						"filter",
						"text"
					),
					filter_attack_traffic: argv["filter-attack-traffic"],
					frequency: argv["frequency"],
					kind: argv["kind"],
					logpull_options: resolveFileToken(
						argv["logpull-options"] as string | undefined,
						"logpull-options",
						"text"
					),
					max_upload_bytes: argv["max-upload-bytes"],
					max_upload_interval_seconds: argv["max-upload-interval-seconds"],
					max_upload_records: argv["max-upload-records"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					output_options: {
						"CVE-2021-44228": argv["output-options-cve-2021-44228"],
						batch_prefix: resolveFileToken(
							argv["output-options-batch-prefix"] as string | undefined,
							"output-options-batch-prefix",
							"text"
						),
						batch_suffix: resolveFileToken(
							argv["output-options-batch-suffix"] as string | undefined,
							"output-options-batch-suffix",
							"text"
						),
						field_delimiter: resolveFileToken(
							argv["output-options-field-delimiter"] as string | undefined,
							"output-options-field-delimiter",
							"text"
						),
						field_names: argv["output-options-field-names"],
						merge_subrequests: argv["output-options-merge-subrequests"],
						output_type: argv["output-options-output-type"],
						record_delimiter: resolveFileToken(
							argv["output-options-record-delimiter"] as string | undefined,
							"output-options-record-delimiter",
							"text"
						),
						record_prefix: resolveFileToken(
							argv["output-options-record-prefix"] as string | undefined,
							"output-options-record-prefix",
							"text"
						),
						record_suffix: resolveFileToken(
							argv["output-options-record-suffix"] as string | undefined,
							"output-options-record-suffix",
							"text"
						),
						record_template: resolveFileToken(
							argv["output-options-record-template"] as string | undefined,
							"output-options-record-template",
							"text"
						),
						sample_rate: argv["output-options-sample-rate"],
						timestamp_format: argv["output-options-timestamp-format"],
					},
					ownership_challenge: resolveFileToken(
						argv["ownership-challenge"] as string | undefined,
						"ownership-challenge",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						job_id: argv["job-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
