import operation from "../../_operations/pipelines/sinks/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "pipelines sinks create",
			classification: {
				safeFlags: [
					"sink-config-file-naming-strategy",
					"format-decimal-encoding",
					"format-timestamp-format",
					"format-unstructured",
					"format-compression",
					"format-type",
					"schema-inferred",
					"type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Defines the name of the Sink."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"Specifies the type of sink.",
						["r2", "r2_data_catalog", "basin_catalog"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf pipelines sinks create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/v1/sinks`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									config: {
										account_id: resolveFileToken(
											argv["sink-config-account-id"] as string | undefined,
											"sink-config-account-id",
											"text"
										),
										bucket: resolveFileToken(
											argv["sink-config-bucket"] as string | undefined,
											"sink-config-bucket",
											"text"
										),
										credentials: {
											access_key_id: resolveFileToken(
												argv["sink-config-credentials-access-key-id"] as
													| string
													| undefined,
												"sink-config-credentials-access-key-id",
												"text"
											),
											secret_access_key: resolveFileToken(
												argv["sink-config-credentials-secret-access-key"] as
													| string
													| undefined,
												"sink-config-credentials-secret-access-key",
												"text"
											),
										},
										file_naming: {
											prefix: resolveFileToken(
												argv["sink-config-file-naming-prefix"] as
													| string
													| undefined,
												"sink-config-file-naming-prefix",
												"text"
											),
											strategy: argv["sink-config-file-naming-strategy"],
											suffix: resolveFileToken(
												argv["sink-config-file-naming-suffix"] as
													| string
													| undefined,
												"sink-config-file-naming-suffix",
												"text"
											),
										},
										jurisdiction: resolveFileToken(
											argv["sink-config-jurisdiction"] as string | undefined,
											"sink-config-jurisdiction",
											"text"
										),
										partitioning: {
											time_pattern: resolveFileToken(
												argv["sink-config-partitioning-time-pattern"] as
													| string
													| undefined,
												"sink-config-partitioning-time-pattern",
												"text"
											),
										},
										path: resolveFileToken(
											argv["sink-config-path"] as string | undefined,
											"sink-config-path",
											"text"
										),
										rolling_policy: {
											file_size_bytes:
												argv["sink-config-rolling-policy-file-size-bytes"],
											inactivity_seconds:
												argv["sink-config-rolling-policy-inactivity-seconds"],
											interval_seconds:
												argv["sink-config-rolling-policy-interval-seconds"],
										},
										namespace: resolveFileToken(
											argv["sink-config-namespace"] as string | undefined,
											"sink-config-namespace",
											"text"
										),
										table_name: resolveFileToken(
											argv["sink-config-table-name"] as string | undefined,
											"sink-config-table-name",
											"text"
										),
										token: resolveFileToken(
											argv["sink-config-token"] as string | undefined,
											"sink-config-token",
											"text"
										),
									},
									format: {
										decimal_encoding: argv["format-decimal-encoding"],
										timestamp_format: argv["format-timestamp-format"],
										unstructured: argv["format-unstructured"],
										compression: argv["format-compression"],
										type: argv["format-type"],
										row_group_bytes: argv["format-row-group-bytes"],
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									schema: {
										fields: parseObjectArray(
											argv["schema-fields"],
											"schema-fields"
										),
										inferred: argv["schema-inferred"],
									},
									type: argv["type"],
								}),
					sensitiveBodyPaths: [
						["config", "credentials", "secret_access_key"],
						["config", "token"],
					],
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				config: {
					account_id: resolveFileToken(
						argv["sink-config-account-id"] as string | undefined,
						"sink-config-account-id",
						"text"
					),
					bucket: resolveFileToken(
						argv["sink-config-bucket"] as string | undefined,
						"sink-config-bucket",
						"text"
					),
					credentials: {
						access_key_id: resolveFileToken(
							argv["sink-config-credentials-access-key-id"] as
								| string
								| undefined,
							"sink-config-credentials-access-key-id",
							"text"
						),
						secret_access_key: resolveFileToken(
							argv["sink-config-credentials-secret-access-key"] as
								| string
								| undefined,
							"sink-config-credentials-secret-access-key",
							"text"
						),
					},
					file_naming: {
						prefix: resolveFileToken(
							argv["sink-config-file-naming-prefix"] as string | undefined,
							"sink-config-file-naming-prefix",
							"text"
						),
						strategy: argv["sink-config-file-naming-strategy"],
						suffix: resolveFileToken(
							argv["sink-config-file-naming-suffix"] as string | undefined,
							"sink-config-file-naming-suffix",
							"text"
						),
					},
					jurisdiction: resolveFileToken(
						argv["sink-config-jurisdiction"] as string | undefined,
						"sink-config-jurisdiction",
						"text"
					),
					partitioning: {
						time_pattern: resolveFileToken(
							argv["sink-config-partitioning-time-pattern"] as
								| string
								| undefined,
							"sink-config-partitioning-time-pattern",
							"text"
						),
					},
					path: resolveFileToken(
						argv["sink-config-path"] as string | undefined,
						"sink-config-path",
						"text"
					),
					rolling_policy: {
						file_size_bytes: argv["sink-config-rolling-policy-file-size-bytes"],
						inactivity_seconds:
							argv["sink-config-rolling-policy-inactivity-seconds"],
						interval_seconds:
							argv["sink-config-rolling-policy-interval-seconds"],
					},
					namespace: resolveFileToken(
						argv["sink-config-namespace"] as string | undefined,
						"sink-config-namespace",
						"text"
					),
					table_name: resolveFileToken(
						argv["sink-config-table-name"] as string | undefined,
						"sink-config-table-name",
						"text"
					),
					token: resolveFileToken(
						argv["sink-config-token"] as string | undefined,
						"sink-config-token",
						"text"
					),
				},
				format: {
					decimal_encoding: argv["format-decimal-encoding"],
					timestamp_format: argv["format-timestamp-format"],
					unstructured: argv["format-unstructured"],
					compression: argv["format-compression"],
					type: argv["format-type"],
					row_group_bytes: argv["format-row-group-bytes"],
				},
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				schema: {
					fields: parseObjectArray(argv["schema-fields"], "schema-fields"),
					inferred: argv["schema-inferred"],
				},
				type: argv["type"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
