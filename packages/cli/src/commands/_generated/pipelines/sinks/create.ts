import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
		.option("config-account-id", {
			type: "string",
			description: "Cloudflare Account ID for the bucket",
		})
		.option("config-bucket", {
			type: "string",
			description: "R2 Bucket to write to",
		})
		.option("config-credentials-access-key-id", {
			type: "string",
			description: "Cloudflare Account ID for the bucket",
		})
		.option("config-credentials-secret-access-key", {
			type: "string",
			description: "Cloudflare Account ID for the bucket",
		})
		.option("config-file-naming-prefix", {
			type: "string",
			description: "The prefix to use in file name. i.e prefix-<uuid>.parquet",
		})
		.option("config-file-naming-strategy", {
			type: "string",
			description: "Filename generation strategy.",
			choices: ["serial", "uuid", "uuid_v7", "ulid"],
		})
		.coerce("config-file-naming-strategy", (value: string | undefined) =>
			resolveFileToken(value, "config-file-naming-strategy", "text")
		)
		.option("config-file-naming-suffix", {
			type: "string",
			description:
				"This will overwrite the default file suffix. i.e .parquet, use with caution",
		})
		.option("config-jurisdiction", {
			type: "string",
			description: "Jurisdiction this bucket is hosted in",
		})
		.option("config-partitioning-time-pattern", {
			type: "string",
			description: "The pattern of the date string",
		})
		.option("config-path", {
			type: "string",
			description: "Subpath within the bucket to write to",
		})
		.option("config-rolling-policy-file-size-bytes", {
			type: "number",
			description: "Files will be rolled after reaching this number of bytes",
		})
		.option("config-rolling-policy-inactivity-seconds", {
			type: "number",
			description:
				"Number of seconds of inactivity to wait before rolling over to a new file",
		})
		.option("config-rolling-policy-interval-seconds", {
			type: "number",
			description:
				"Number of seconds to wait before rolling over to a new file",
		})
		.option("config-namespace", {
			type: "string",
			description: "Table namespace",
		})
		.option("config-table-name", { type: "string", description: "Table name" })
		.option("config-token", {
			type: "string",
			description: "Authentication token",
		})
		.option("format-decimal-encoding", {
			type: "string",
			description: "The format.decimal_encoding field",
			choices: ["number", "string", "bytes"],
		})
		.coerce("format-decimal-encoding", (value: string | undefined) =>
			resolveFileToken(value, "format-decimal-encoding", "text")
		)
		.option("format-timestamp-format", {
			type: "string",
			description: "The format.timestamp_format field",
			choices: ["rfc3339", "unix_millis"],
		})
		.coerce("format-timestamp-format", (value: string | undefined) =>
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
		.coerce("format-compression", (value: string | undefined) =>
			resolveFileToken(value, "format-compression", "text")
		)
		.option("format-type", {
			type: "string",
			description: "The format.type field",
			choices: ["json", "parquet"],
		})
		.coerce("format-type", (value: string | undefined) =>
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
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("config-credentials-access-key-id", [
			"config-namespace",
			"config-table-name",
			"config-token",
		])
		.conflicts("config-credentials-secret-access-key", [
			"config-namespace",
			"config-table-name",
			"config-token",
		])
		.conflicts("config-file-naming-prefix", [
			"config-namespace",
			"config-table-name",
			"config-token",
		])
		.conflicts("config-file-naming-strategy", [
			"config-namespace",
			"config-table-name",
			"config-token",
		])
		.conflicts("config-file-naming-suffix", [
			"config-namespace",
			"config-table-name",
			"config-token",
		])
		.conflicts("config-jurisdiction", [
			"config-namespace",
			"config-table-name",
			"config-token",
		])
		.conflicts("config-partitioning-time-pattern", [
			"config-namespace",
			"config-table-name",
			"config-token",
		])
		.conflicts("config-path", [
			"config-namespace",
			"config-table-name",
			"config-token",
		])
		.conflicts("config-namespace", [
			"config-credentials-access-key-id",
			"config-credentials-secret-access-key",
			"config-file-naming-prefix",
			"config-file-naming-strategy",
			"config-file-naming-suffix",
			"config-jurisdiction",
			"config-partitioning-time-pattern",
			"config-path",
		])
		.conflicts("config-table-name", [
			"config-credentials-access-key-id",
			"config-credentials-secret-access-key",
			"config-file-naming-prefix",
			"config-file-naming-strategy",
			"config-file-naming-suffix",
			"config-jurisdiction",
			"config-partitioning-time-pattern",
			"config-path",
		])
		.implies("config-table-name", ["config-token"])
		.conflicts("config-token", [
			"config-credentials-access-key-id",
			"config-credentials-secret-access-key",
			"config-file-naming-prefix",
			"config-file-naming-strategy",
			"config-file-naming-suffix",
			"config-jurisdiction",
			"config-partitioning-time-pattern",
			"config-path",
		])
		.implies("config-token", ["config-table-name"])
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
				"config-account-id",
				"config-bucket",
				"config-credentials-access-key-id",
				"config-credentials-secret-access-key",
				"config-file-naming-prefix",
				"config-file-naming-strategy",
				"config-file-naming-suffix",
				"config-jurisdiction",
				"config-partitioning-time-pattern",
				"config-path",
				"config-rolling-policy-file-size-bytes",
				"config-rolling-policy-inactivity-seconds",
				"config-rolling-policy-interval-seconds",
				"config-namespace",
				"config-table-name",
				"config-token",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const requiredConflicts: Record<string, string[]> = {
					"config-credentials-access-key-id": [
						"config-namespace",
						"config-table-name",
						"config-token",
					],
					"config-credentials-secret-access-key": [
						"config-namespace",
						"config-table-name",
						"config-token",
					],
				};
				const missing = [
					"config-account-id",
					"config-bucket",
					"config-credentials-access-key-id",
					"config-credentials-secret-access-key",
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

type Request = SdkRequest<"postV4AccountsByAccount_idPipelinesV1Sinks">;
type Body = Request;

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
						"config-file-naming-strategy",
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
												argv["config-account-id"] as string | undefined,
												"config-account-id",
												"text"
											),
											bucket: resolveFileToken(
												argv["config-bucket"] as string | undefined,
												"config-bucket",
												"text"
											),
											credentials: {
												access_key_id: resolveFileToken(
													argv["config-credentials-access-key-id"] as
														| string
														| undefined,
													"config-credentials-access-key-id",
													"text"
												),
												secret_access_key: resolveFileToken(
													argv["config-credentials-secret-access-key"] as
														| string
														| undefined,
													"config-credentials-secret-access-key",
													"text"
												),
											},
											file_naming: {
												prefix: resolveFileToken(
													argv["config-file-naming-prefix"] as
														| string
														| undefined,
													"config-file-naming-prefix",
													"text"
												),
												strategy: argv["config-file-naming-strategy"],
												suffix: resolveFileToken(
													argv["config-file-naming-suffix"] as
														| string
														| undefined,
													"config-file-naming-suffix",
													"text"
												),
											},
											jurisdiction: resolveFileToken(
												argv["config-jurisdiction"] as string | undefined,
												"config-jurisdiction",
												"text"
											),
											partitioning: {
												time_pattern: resolveFileToken(
													argv["config-partitioning-time-pattern"] as
														| string
														| undefined,
													"config-partitioning-time-pattern",
													"text"
												),
											},
											path: resolveFileToken(
												argv["config-path"] as string | undefined,
												"config-path",
												"text"
											),
											rolling_policy: {
												file_size_bytes:
													argv["config-rolling-policy-file-size-bytes"],
												inactivity_seconds:
													argv["config-rolling-policy-inactivity-seconds"],
												interval_seconds:
													argv["config-rolling-policy-interval-seconds"],
											},
											namespace: resolveFileToken(
												argv["config-namespace"] as string | undefined,
												"config-namespace",
												"text"
											),
											table_name: resolveFileToken(
												argv["config-table-name"] as string | undefined,
												"config-table-name",
												"text"
											),
											token: resolveFileToken(
												argv["config-token"] as string | undefined,
												"config-token",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.pipelines.sinks.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
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
				const bodyData = compactBody<Body>({
					config: {
						account_id: resolveFileToken(
							argv["config-account-id"] as string | undefined,
							"config-account-id",
							"text"
						),
						bucket: resolveFileToken(
							argv["config-bucket"] as string | undefined,
							"config-bucket",
							"text"
						),
						credentials: {
							access_key_id: resolveFileToken(
								argv["config-credentials-access-key-id"] as string | undefined,
								"config-credentials-access-key-id",
								"text"
							),
							secret_access_key: resolveFileToken(
								argv["config-credentials-secret-access-key"] as
									| string
									| undefined,
								"config-credentials-secret-access-key",
								"text"
							),
						},
						file_naming: {
							prefix: resolveFileToken(
								argv["config-file-naming-prefix"] as string | undefined,
								"config-file-naming-prefix",
								"text"
							),
							strategy: argv["config-file-naming-strategy"],
							suffix: resolveFileToken(
								argv["config-file-naming-suffix"] as string | undefined,
								"config-file-naming-suffix",
								"text"
							),
						},
						jurisdiction: resolveFileToken(
							argv["config-jurisdiction"] as string | undefined,
							"config-jurisdiction",
							"text"
						),
						partitioning: {
							time_pattern: resolveFileToken(
								argv["config-partitioning-time-pattern"] as string | undefined,
								"config-partitioning-time-pattern",
								"text"
							),
						},
						path: resolveFileToken(
							argv["config-path"] as string | undefined,
							"config-path",
							"text"
						),
						rolling_policy: {
							file_size_bytes: argv["config-rolling-policy-file-size-bytes"],
							inactivity_seconds:
								argv["config-rolling-policy-inactivity-seconds"],
							interval_seconds: argv["config-rolling-policy-interval-seconds"],
						},
						namespace: resolveFileToken(
							argv["config-namespace"] as string | undefined,
							"config-namespace",
							"text"
						),
						table_name: resolveFileToken(
							argv["config-table-name"] as string | undefined,
							"config-table-name",
							"text"
						),
						token: resolveFileToken(
							argv["config-token"] as string | undefined,
							"config-token",
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
					client.pipelines.sinks.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
