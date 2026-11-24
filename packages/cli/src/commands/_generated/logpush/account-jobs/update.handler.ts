import operation from "../../_operations/logpush/account-jobs/update.js";
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
					argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
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
											argv["output-options-field-delimiter"] as
												| string
												| undefined,
											"output-options-field-delimiter",
											"text"
										),
										field_names: argv["output-options-field-names"],
										merge_subrequests: argv["output-options-merge-subrequests"],
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
	);
}
