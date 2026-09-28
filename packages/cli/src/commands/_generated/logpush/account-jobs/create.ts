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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/logpush.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 logpush account-jobs create\n\nCreates a new Logpush job for an account or zone."
		)
		.option("dataset", {
			type: "string",
			description:
				"Name of the dataset. A list of supported datasets can be found on the [Developer Docs](https://developers.cloudflare.com/logs/reference/log-fields/).",
			choices: [
				"access_requests",
				"account_abuse_protection_events",
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
			default: "http_requests",
		})
		.option("destination-conf", {
			type: "string",
			description:
				"Uniquely identifies a resource (such as an s3 bucket) where data. will be pushed. Additional configuration parameters supported by the destination may be included.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Flag that indicates if the job is enabled.",
			default: false,
		})
		.option("filter", {
			type: "string",
			description:
				"The filters to select the events to include and/or remove from your logs. For more information, refer to [Filters](https://developers.cloudflare.com/logs/reference/filters/).",
		})
		.option("filter-attack-traffic", {
			type: "boolean",
			description:
				"When true, excludes DDoS attack traffic from logs. This option is supported for the `http_requests`, `firewall_events`, and `network_analytics_logs` datasets.",
			default: false,
		})
		.option("frequency", {
			type: "string",
			description:
				"This field is deprecated. Please use `max_upload_*` parameters instead. . The frequency at which Cloudflare sends batches of logs to your destination. Setting frequency to high sends your logs in larger quantities of smaller files. Setting frequency to low sends logs in smaller quantities of larger files.",
			choices: ["high", "low"],
			default: "high",
		})
		.option("kind", {
			type: "string",
			description:
				"The kind parameter (optional) is used to differentiate between Logpush and Edge Log Delivery jobs (when supported by the dataset).",
			choices: ["edge"],
			default: "",
		})
		.option("logpull-options", {
			type: "string",
			description:
				"This field is deprecated. Use `output_options` instead. Configuration string. It specifies things like requested fields and timestamp formats. If migrating from the logpull api, copy the url (full url or just the query string) of your call here, and logpush will keep on making this call for you, setting start and end times appropriately.",
		})
		.option("name", {
			type: "string",
			description:
				"Optional human readable job name. Not unique. Cloudflare suggests. that you set this to a meaningful string, like the domain name, to make it easier to identify your job.",
		})
		.option("output-options-cve-2021-44228", {
			type: "boolean",
			description:
				"If set to true, will cause all occurrences of `${` in the generated files to be replaced with `x{`.",
		})
		.option("output-options-batch-prefix", {
			type: "string",
			description: "String to be prepended before each batch.",
		})
		.option("output-options-batch-suffix", {
			type: "string",
			description: "String to be appended after each batch.",
		})
		.option("output-options-field-delimiter", {
			type: "string",
			description:
				"String to join fields. This field be ignored when `record_template` is set.",
		})
		.option("output-options-field-names", {
			type: "string",
			array: true,
			description:
				"List of field names to be included in the Logpush output. For the moment, there is no option to add all fields at once, so you must specify all the fields names you are interested in.",
		})
		.option("output-options-merge-subrequests", {
			type: "boolean",
			description:
				"If set to true, subrequests will be merged into the parent request. Only supported for the `http_requests` dataset.",
		})
		.option("output-options-output-type", {
			type: "string",
			description:
				"Specifies the output type, such as `ndjson` or `csv`. This sets default values for the rest of the settings, depending on the chosen output type. Some formatting rules, like string quoting, are different between output types.",
			choices: ["ndjson", "csv"],
		})
		.option("output-options-record-delimiter", {
			type: "string",
			description: "String to be inserted in-between the records as separator.",
		})
		.option("output-options-record-prefix", {
			type: "string",
			description: "String to be prepended before each record.",
		})
		.option("output-options-record-suffix", {
			type: "string",
			description: "String to be appended after each record.",
		})
		.option("output-options-record-template", {
			type: "string",
			description:
				"String to use as template for each record instead of the default json key value mapping. All fields used in the template must be present in `field_names` as well, otherwise they will end up as null. Format as a Go `text/template` without any standard functions, like conditionals, loops, sub-templates, etc.",
		})
		.option("output-options-sample-rate", {
			type: "number",
			description:
				"Specifies the sampling rate as a floating number greater than 0 and at most 1. Sampling is applied on top of filtering, and regardless of the current `sample_interval` of the data.",
		})
		.option("output-options-timestamp-format", {
			type: "string",
			description:
				"String to specify the format for timestamps, such as `unixnano`, `unix`, `rfc3339`, `rfc3339ms` or `rfc3339ns`.",
			choices: ["unixnano", "unix", "rfc3339", "rfc3339ms", "rfc3339ns"],
		})
		.option("ownership-challenge", {
			type: "string",
			description: "Ownership challenge token to prove destination ownership.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/logpush/jobs">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Logpush job",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logpush account-jobs create",
				classification: {
					safeFlags: [
						"dataset",
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
						command: "cf logpush account-jobs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/logpush/jobs`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										dataset: resolveFileToken(
											argv["dataset"] as string | undefined,
											"dataset",
											"text"
										),
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
										frequency: resolveFileToken(
											argv["frequency"] as string | undefined,
											"frequency",
											"text"
										),
										kind: resolveFileToken(
											argv["kind"] as string | undefined,
											"kind",
											"text"
										),
										logpull_options: resolveFileToken(
											argv["logpull-options"] as string | undefined,
											"logpull-options",
											"text"
										),
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
											output_type: resolveFileToken(
												argv["output-options-output-type"] as
													| string
													| undefined,
												"output-options-output-type",
												"text"
											),
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
											timestamp_format: resolveFileToken(
												argv["output-options-timestamp-format"] as
													| string
													| undefined,
												"output-options-timestamp-format",
												"text"
											),
										},
										ownership_challenge: resolveFileToken(
											argv["ownership-challenge"] as string | undefined,
											"ownership-challenge",
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
						client.logpush.accountJobs.create({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["destination-conf"] === undefined) {
					argv["destination-conf"] = await promptForRequiredField(
						"destination-conf",
						"Uniquely identifies a resource (such as an s3 bucket) where data. will be pushed. Additional configuration parameters supported by the destination may be included.",
						{ kind: "secret" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					dataset: resolveFileToken(
						argv["dataset"] as string | undefined,
						"dataset",
						"text"
					),
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
					frequency: resolveFileToken(
						argv["frequency"] as string | undefined,
						"frequency",
						"text"
					),
					kind: resolveFileToken(
						argv["kind"] as string | undefined,
						"kind",
						"text"
					),
					logpull_options: resolveFileToken(
						argv["logpull-options"] as string | undefined,
						"logpull-options",
						"text"
					),
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
						output_type: resolveFileToken(
							argv["output-options-output-type"] as string | undefined,
							"output-options-output-type",
							"text"
						),
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
						timestamp_format: resolveFileToken(
							argv["output-options-timestamp-format"] as string | undefined,
							"output-options-timestamp-format",
							"text"
						),
					},
					ownership_challenge: resolveFileToken(
						argv["ownership-challenge"] as string | undefined,
						"ownership-challenge",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.logpush.accountJobs.create({
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
