import operation from "../../_operations/pipelines/sinks/create.js";
/**
 * create command
 * @generated from apis/overlays/pipelines.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create Sink",
	usage: "$0 pipelines sinks create\n\nCreate a new Sink.",
	flags: {
		"sink-config-account-id": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- Cloudflare Account ID for the bucket\n- Cloudflare Account ID",
			optional: true,
			parse: String,
		},
		"sink-config-bucket": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- R2 Bucket to write to\n- The R2 Bucket that hosts this catalog",
			optional: true,
			parse: String,
		},
		"sink-config-credentials-access-key-id": {
			kind: "parsed",
			brief: "Cloudflare Account ID for the bucket",
			optional: true,
			parse: String,
		},
		"sink-config-credentials-secret-access-key": {
			kind: "parsed",
			brief: "Cloudflare Account ID for the bucket",
			optional: true,
			parse: String,
		},
		"sink-config-file-naming-prefix": {
			kind: "parsed",
			brief: "The prefix to use in file name. i.e prefix-<uuid>.parquet",
			optional: true,
			parse: String,
		},
		"sink-config-file-naming-strategy": {
			kind: "parsed",
			brief: "Filename generation strategy.",
			optional: true,
			choices: ["serial", "uuid", "uuid_v7", "ulid"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "sink-config-file-naming-strategy", "text"),
		},
		"sink-config-file-naming-suffix": {
			kind: "parsed",
			brief:
				"This will overwrite the default file suffix. i.e .parquet, use with caution",
			optional: true,
			parse: String,
		},
		"sink-config-jurisdiction": {
			kind: "parsed",
			brief: "Jurisdiction this bucket is hosted in",
			optional: true,
			parse: String,
		},
		"sink-config-partitioning-time-pattern": {
			kind: "parsed",
			brief: "The pattern of the date string",
			optional: true,
			parse: String,
		},
		"sink-config-path": {
			kind: "parsed",
			brief: "Subpath within the bucket to write to",
			optional: true,
			parse: String,
		},
		"sink-config-rolling-policy-file-size-bytes": {
			kind: "parsed",
			brief: "Files will be rolled after reaching this number of bytes",
			optional: true,
			parse: Number,
		},
		"sink-config-rolling-policy-inactivity-seconds": {
			kind: "parsed",
			brief:
				"Number of seconds of inactivity to wait before rolling over to a new file",
			optional: true,
			parse: Number,
		},
		"sink-config-rolling-policy-interval-seconds": {
			kind: "parsed",
			brief: "Number of seconds to wait before rolling over to a new file",
			optional: true,
			parse: Number,
		},
		"sink-config-namespace": {
			kind: "parsed",
			brief: "Table namespace",
			optional: true,
			parse: String,
		},
		"sink-config-table-name": {
			kind: "parsed",
			brief: "Table name",
			optional: true,
			parse: String,
		},
		"sink-config-token": {
			kind: "parsed",
			brief: "Authentication token",
			optional: true,
			parse: String,
		},
		"format-decimal-encoding": {
			kind: "parsed",
			brief: "The format.decimal_encoding field",
			optional: true,
			choices: ["number", "string", "bytes"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "format-decimal-encoding", "text"),
		},
		"format-timestamp-format": {
			kind: "parsed",
			brief: "The format.timestamp_format field",
			optional: true,
			choices: ["rfc3339", "unix_millis"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "format-timestamp-format", "text"),
		},
		"format-unstructured": {
			kind: "boolean",
			brief: "The format.unstructured field",
			optional: true,
		},
		"format-compression": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- `uncompressed`, `gzip`: Specifies the compression applied to JSON sink output.",
			optional: true,
			choices: ["uncompressed", "gzip", "snappy", "zstd", "lz4"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "format-compression", "text"),
		},
		"format-type": {
			kind: "parsed",
			brief: "The format.type field",
			optional: true,
			choices: ["json", "parquet"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "format-type", "text"),
		},
		"format-row-group-bytes": {
			kind: "parsed",
			brief: "The format.row_group_bytes field",
			optional: true,
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief: "Defines the name of the Sink.",
			optional: true,
			parse: String,
		},
		"schema-fields": {
			kind: "parsed",
			brief:
				'The schema.fields field. Provide as a JSON array of objects or @path/to/file.json. Shape: [(({"type": "int32"} | {"type": "int64"} | {"type": "float32"} | ...more) & {"name": string, "metadata_key"?: (string | null), "required"?: boolean, "sql_name"?: string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"schema-inferred": {
			kind: "boolean",
			brief: "The schema.inferred field",
			optional: true,
		},
		type: {
			kind: "parsed",
			brief: "Specifies the type of sink.",
			optional: true,
			choices: ["r2", "r2_data_catalog", "basin_catalog"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
		rules.conflicts("sink-config-credentials-access-key-id", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.implies("sink-config-credentials-access-key-id", [
			"sink-config-credentials-secret-access-key",
		]);
		rules.conflicts("sink-config-credentials-secret-access-key", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.implies("sink-config-credentials-secret-access-key", [
			"sink-config-credentials-access-key-id",
		]);
		rules.conflicts("sink-config-file-naming-prefix", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.implies("sink-config-file-naming-prefix", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
		]);
		rules.conflicts("sink-config-file-naming-strategy", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.implies("sink-config-file-naming-strategy", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
		]);
		rules.conflicts("sink-config-file-naming-suffix", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.implies("sink-config-file-naming-suffix", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
		]);
		rules.conflicts("sink-config-jurisdiction", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.implies("sink-config-jurisdiction", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
		]);
		rules.conflicts("sink-config-partitioning-time-pattern", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.implies("sink-config-partitioning-time-pattern", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
		]);
		rules.conflicts("sink-config-path", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.implies("sink-config-path", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
		]);
		rules.conflicts("sink-config-namespace", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
			"sink-config-file-naming-prefix",
			"sink-config-file-naming-strategy",
			"sink-config-file-naming-suffix",
			"sink-config-jurisdiction",
			"sink-config-partitioning-time-pattern",
			"sink-config-path",
		]);
		rules.implies("sink-config-namespace", [
			"sink-config-table-name",
			"sink-config-token",
		]);
		rules.conflicts("sink-config-table-name", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
			"sink-config-file-naming-prefix",
			"sink-config-file-naming-strategy",
			"sink-config-file-naming-suffix",
			"sink-config-jurisdiction",
			"sink-config-partitioning-time-pattern",
			"sink-config-path",
		]);
		rules.implies("sink-config-table-name", ["sink-config-token"]);
		rules.conflicts("sink-config-token", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
			"sink-config-file-naming-prefix",
			"sink-config-file-naming-strategy",
			"sink-config-file-naming-suffix",
			"sink-config-jurisdiction",
			"sink-config-partitioning-time-pattern",
			"sink-config-path",
		]);
		rules.implies("sink-config-token", ["sink-config-table-name"]);
		rules.conflicts("format-decimal-encoding", ["format-row-group-bytes"]);
		rules.conflicts("format-timestamp-format", ["format-row-group-bytes"]);
		rules.conflicts("format-unstructured", ["format-row-group-bytes"]);
		rules.conflicts("format-row-group-bytes", [
			"format-decimal-encoding",
			"format-timestamp-format",
			"format-unstructured",
		]);
		rules.check((argv) => {
			const groupSet = [
				"sink-config-account-id",
				"sink-config-bucket",
				"sink-config-credentials-access-key-id",
				"sink-config-credentials-secret-access-key",
				"sink-config-file-naming-prefix",
				"sink-config-file-naming-strategy",
				"sink-config-file-naming-suffix",
				"sink-config-jurisdiction",
				"sink-config-partitioning-time-pattern",
				"sink-config-path",
				"sink-config-rolling-policy-file-size-bytes",
				"sink-config-rolling-policy-inactivity-seconds",
				"sink-config-rolling-policy-interval-seconds",
				"sink-config-namespace",
				"sink-config-table-name",
				"sink-config-token",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["sink-config-account-id", "sink-config-bucket"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when one of --sink-config-account-id, --sink-config-bucket, --sink-config-credentials-access-key-id, --sink-config-credentials-secret-access-key, --sink-config-file-naming-prefix, --sink-config-file-naming-strategy, --sink-config-file-naming-suffix, --sink-config-jurisdiction, --sink-config-partitioning-time-pattern, --sink-config-path, --sink-config-rolling-policy-file-size-bytes, --sink-config-rolling-policy-inactivity-seconds, --sink-config-rolling-policy-interval-seconds, --sink-config-namespace, --sink-config-table-name, --sink-config-token is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"format-decimal-encoding",
				"format-timestamp-format",
				"format-unstructured",
				"format-compression",
				"format-type",
				"format-row-group-bytes",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["format-type"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --format-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
		),
});

export default command;
