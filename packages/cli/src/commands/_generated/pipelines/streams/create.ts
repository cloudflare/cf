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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 pipelines streams create\n\nCreate a new Stream.")
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
		.option("format-type", {
			type: "string",
			description: "The format.type field",
			choices: ["json", "parquet"],
		})
		.coerce("format-type", (value) =>
			resolveFileToken(value, "format-type", "text")
		)
		.option("format-compression", {
			type: "string",
			description: "The format.compression field",
			choices: ["uncompressed", "snappy", "gzip", "zstd", "lz4"],
		})
		.coerce("format-compression", (value) =>
			resolveFileToken(value, "format-compression", "text")
		)
		.option("format-row-group-bytes", {
			type: "number",
			description: "The format.row_group_bytes field",
		})
		.option("http-authentication", {
			type: "boolean",
			description:
				"Indicates that authentication is required for the HTTP endpoint.",
		})
		.option("http-cors-origins", {
			type: "string",
			array: true,
			description: "The http.cors.origins field",
		})
		.option("http-enabled", {
			type: "boolean",
			description: "Indicates that the HTTP endpoint is enabled.",
		})
		.option("name", {
			type: "string",
			description: "Specifies the name of the Stream.",
		})
		.option("schema-inferred", {
			type: "boolean",
			description: "The schema.inferred field",
		})
		.option("worker-binding-enabled", {
			type: "boolean",
			description: "Indicates that the worker binding is enabled.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("format-decimal-encoding", [
			"format-compression",
			"format-row-group-bytes",
		])
		.conflicts("format-timestamp-format", [
			"format-compression",
			"format-row-group-bytes",
		])
		.conflicts("format-unstructured", [
			"format-compression",
			"format-row-group-bytes",
		])
		.conflicts("format-compression", [
			"format-decimal-encoding",
			"format-timestamp-format",
			"format-unstructured",
		])
		.conflicts("format-row-group-bytes", [
			"format-decimal-encoding",
			"format-timestamp-format",
			"format-unstructured",
		])
		.check((argv) => {
			const groupSet = [
				"format-decimal-encoding",
				"format-timestamp-format",
				"format-unstructured",
				"format-type",
				"format-compression",
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
		})
		.check((argv) => {
			const groupSet = [
				"http-authentication",
				"http-cors-origins",
				"http-enabled",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
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
		})
		.check((argv) => {
			const groupSet = ["worker-binding-enabled"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["worker-binding-enabled"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --worker_binding-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"postV4AccountsByAccount_idPipelinesV1Streams">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Stream",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
											inferred: argv["schema-inferred"],
										},
										worker_binding: {
											enabled: argv["worker-binding-enabled"],
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.pipelines.streams.create({
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
						"Specifies the name of the Stream."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						inferred: argv["schema-inferred"],
					},
					worker_binding: {
						enabled: argv["worker-binding-enabled"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.pipelines.streams.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
