import operation from "../../_operations/pipelines/streams/create.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Stream",
	usage: "$0 pipelines streams create\n\nCreate a new Stream.",
	flags: {
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
		"format-type": {
			kind: "parsed",
			brief: "The format.type field",
			optional: true,
			choices: ["json", "parquet"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "format-type", "text"),
		},
		"format-compression": {
			kind: "parsed",
			brief: "The format.compression field",
			optional: true,
			choices: ["uncompressed", "snappy", "gzip", "zstd", "lz4"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "format-compression", "text"),
		},
		"format-row-group-bytes": {
			kind: "parsed",
			brief: "The format.row_group_bytes field",
			optional: true,
			parse: Number,
		},
		"http-authentication": {
			kind: "boolean",
			brief: "Indicates that authentication is required for the HTTP endpoint.",
			optional: true,
		},
		"http-cors-origins": {
			kind: "parsed",
			brief: "The http.cors.origins field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"http-enabled": {
			kind: "boolean",
			brief: "Indicates that the HTTP endpoint is enabled.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Specifies the name of the Stream.",
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
		"worker-binding-enabled": {
			kind: "boolean",
			brief: "Indicates that the worker binding is enabled.",
			optional: true,
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
		rules.conflicts("format-decimal-encoding", [
			"format-compression",
			"format-row-group-bytes",
		]);
		rules.conflicts("format-timestamp-format", [
			"format-compression",
			"format-row-group-bytes",
		]);
		rules.conflicts("format-unstructured", [
			"format-compression",
			"format-row-group-bytes",
		]);
		rules.conflicts("format-compression", [
			"format-decimal-encoding",
			"format-timestamp-format",
			"format-unstructured",
		]);
		rules.conflicts("format-row-group-bytes", [
			"format-decimal-encoding",
			"format-timestamp-format",
			"format-unstructured",
		]);
		rules.check((argv) => {
			const groupSet = [
				"format-decimal-encoding",
				"format-timestamp-format",
				"format-unstructured",
				"format-type",
				"format-compression",
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
		rules.check((argv) => {
			const groupSet = [
				"http-authentication",
				"http-cors-origins",
				"http-enabled",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["http-authentication", "http-enabled"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --http-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pipelines streams create",
				classification: {
					safeFlags: [
						"format-decimal-encoding",
						"format-timestamp-format",
						"format-unstructured",
						"format-type",
						"format-compression",
						"http-authentication",
						"http-enabled",
						"schema-inferred",
						"worker-binding-enabled",
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
							"Specifies the name of the Stream."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pipelines streams create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/v1/streams`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										format: {
											decimal_encoding: argv["format-decimal-encoding"],
											timestamp_format: argv["format-timestamp-format"],
											unstructured: argv["format-unstructured"],
											type: argv["format-type"],
											compression: argv["format-compression"],
											row_group_bytes: argv["format-row-group-bytes"],
										},
										http: {
											authentication: argv["http-authentication"],
											cors: {
												origins: argv["http-cors-origins"],
											},
											enabled: argv["http-enabled"],
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
										worker_binding: {
											enabled: argv["worker-binding-enabled"],
										},
									}),
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
					format: {
						decimal_encoding: argv["format-decimal-encoding"],
						timestamp_format: argv["format-timestamp-format"],
						unstructured: argv["format-unstructured"],
						type: argv["format-type"],
						compression: argv["format-compression"],
						row_group_bytes: argv["format-row-group-bytes"],
					},
					http: {
						authentication: argv["http-authentication"],
						cors: {
							origins: argv["http-cors-origins"],
						},
						enabled: argv["http-enabled"],
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
					worker_binding: {
						enabled: argv["worker-binding-enabled"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
