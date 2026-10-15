import operation from "../../_operations/pipelines/sinks/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/pipelines.ts
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
		.usage("$0 pipelines sinks create\n\nCreate a new Sink.")
		.option("sink-config-account-id", {
			type: "string",
			description: "Cloudflare Account ID for the bucket",
		})
		.option("sink-config-bucket", {
			type: "string",
			description: "R2 Bucket to write to",
		})
		.option("sink-config-credentials-access-key-id", {
			type: "string",
			description: "Cloudflare Account ID for the bucket",
		})
		.option("sink-config-credentials-secret-access-key", {
			type: "string",
			description: "Cloudflare Account ID for the bucket",
		})
		.option("sink-config-file-naming-prefix", {
			type: "string",
			description: "The prefix to use in file name. i.e prefix-<uuid>.parquet",
		})
		.option("sink-config-file-naming-strategy", {
			type: "string",
			description: "Filename generation strategy.",
			choices: ["serial", "uuid", "uuid_v7", "ulid"],
		})
		.coerce("sink-config-file-naming-strategy", (value) =>
			resolveFileToken(value, "sink-config-file-naming-strategy", "text")
		)
		.option("sink-config-file-naming-suffix", {
			type: "string",
			description:
				"This will overwrite the default file suffix. i.e .parquet, use with caution",
		})
		.option("sink-config-jurisdiction", {
			type: "string",
			description: "Jurisdiction this bucket is hosted in",
		})
		.option("sink-config-partitioning-time-pattern", {
			type: "string",
			description: "The pattern of the date string",
		})
		.option("sink-config-path", {
			type: "string",
			description: "Subpath within the bucket to write to",
		})
		.option("sink-config-rolling-policy-file-size-bytes", {
			type: "number",
			description: "Files will be rolled after reaching this number of bytes",
		})
		.option("sink-config-rolling-policy-inactivity-seconds", {
			type: "number",
			description:
				"Number of seconds of inactivity to wait before rolling over to a new file",
		})
		.option("sink-config-rolling-policy-interval-seconds", {
			type: "number",
			description:
				"Number of seconds to wait before rolling over to a new file",
		})
		.option("sink-config-namespace", {
			type: "string",
			description: "Table namespace",
		})
		.option("sink-config-table-name", {
			type: "string",
			description: "Table name",
		})
		.option("sink-config-token", {
			type: "string",
			description: "Authentication token",
		})
		.option("format-decimal-encoding", {
			type: "string",
			description: "The format.decimal_encoding field",
			choices: ["number", "string", "bytes"],
		})
		.coerce("format-decimal-encoding", (value) =>
			resolveFileToken(value, "format-decimal-encoding", "text")
		)
		.option("format-timestamp-format", {
			type: "string",
			description: "The format.timestamp_format field",
			choices: ["rfc3339", "unix_millis"],
		})
		.coerce("format-timestamp-format", (value) =>
			resolveFileToken(value, "format-timestamp-format", "text")
		)
		.option("format-unstructured", {
			type: "boolean",
			description: "The format.unstructured field",
		})
		.option("format-compression", {
			type: "string",
			description: "Specifies the compression applied to JSON sink output.",
			choices: ["uncompressed", "gzip", "snappy", "zstd", "lz4"],
		})
		.coerce("format-compression", (value) =>
			resolveFileToken(value, "format-compression", "text")
		)
		.option("format-type", {
			type: "string",
			description: "The format.type field",
			choices: ["json", "parquet"],
		})
		.coerce("format-type", (value) =>
			resolveFileToken(value, "format-type", "text")
		)
		.option("format-row-group-bytes", {
			type: "number",
			description: "The format.row_group_bytes field",
		})
		.option("name", {
			type: "string",
			description: "Defines the name of the Sink.",
		})
		.option("schema-inferred", {
			type: "boolean",
			description: "The schema.inferred field",
		})
		.option("type", {
			type: "string",
			description: "Specifies the type of sink.",
			choices: ["r2", "r2_data_catalog", "basin_catalog"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("sink-config-credentials-access-key-id", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		])
		.conflicts("sink-config-credentials-secret-access-key", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		])
		.conflicts("sink-config-file-naming-prefix", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		])
		.conflicts("sink-config-file-naming-strategy", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		])
		.conflicts("sink-config-file-naming-suffix", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		])
		.conflicts("sink-config-jurisdiction", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		])
		.conflicts("sink-config-partitioning-time-pattern", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		])
		.conflicts("sink-config-path", [
			"sink-config-namespace",
			"sink-config-table-name",
			"sink-config-token",
		])
		.conflicts("sink-config-namespace", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
			"sink-config-file-naming-prefix",
			"sink-config-file-naming-strategy",
			"sink-config-file-naming-suffix",
			"sink-config-jurisdiction",
			"sink-config-partitioning-time-pattern",
			"sink-config-path",
		])
		.conflicts("sink-config-table-name", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
			"sink-config-file-naming-prefix",
			"sink-config-file-naming-strategy",
			"sink-config-file-naming-suffix",
			"sink-config-jurisdiction",
			"sink-config-partitioning-time-pattern",
			"sink-config-path",
		])
		.implies("sink-config-table-name", ["sink-config-token"])
		.conflicts("sink-config-token", [
			"sink-config-credentials-access-key-id",
			"sink-config-credentials-secret-access-key",
			"sink-config-file-naming-prefix",
			"sink-config-file-naming-strategy",
			"sink-config-file-naming-suffix",
			"sink-config-jurisdiction",
			"sink-config-partitioning-time-pattern",
			"sink-config-path",
		])
		.implies("sink-config-token", ["sink-config-table-name"])
		.conflicts("format-decimal-encoding", ["format-row-group-bytes"])
		.conflicts("format-timestamp-format", ["format-row-group-bytes"])
		.conflicts("format-unstructured", ["format-row-group-bytes"])
		.conflicts("format-row-group-bytes", [
			"format-decimal-encoding",
			"format-timestamp-format",
			"format-unstructured",
		])
		.check((argv) => {
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
			if (groupSet) {
				const requiredConflicts: Record<string, string[]> = {
					"sink-config-credentials-access-key-id": [
						"sink-config-namespace",
						"sink-config-table-name",
						"sink-config-token",
					],
					"sink-config-credentials-secret-access-key": [
						"sink-config-namespace",
						"sink-config-table-name",
						"sink-config-token",
					],
				};
				const missing = [
					"sink-config-account-id",
					"sink-config-bucket",
					"sink-config-credentials-access-key-id",
					"sink-config-credentials-secret-access-key",
				].filter(
					(k) =>
						argv[k] === undefined &&
						!(requiredConflicts[k] ?? []).some((x) => argv[x] !== undefined)
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --config-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"format-decimal-encoding",
				"format-timestamp-format",
				"format-unstructured",
				"format-compression",
				"format-type",
				"format-row-group-bytes",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["format-type"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --format-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Sink",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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
};

export default command;
