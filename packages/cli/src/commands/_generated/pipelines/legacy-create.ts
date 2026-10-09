import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * legacy-create command
 * @generated from apis/overlays/pipelines.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pipelines legacy-create\n\n[DEPRECATED] Create a new pipeline. Use the new /pipelines/v1/pipelines endpoint instead."
		)
		.option("destination-batch-max-bytes", {
			type: "number",
			description: "Specifies rough maximum size of files.",
			default: 100000000,
		})
		.option("destination-batch-max-duration-s", {
			type: "number",
			description: "Specifies duration to wait to aggregate batches files.",
			default: 300,
		})
		.option("destination-batch-max-rows", {
			type: "number",
			description: "Specifies rough maximum number of rows per file.",
			default: 10000000,
		})
		.option("destination-compression-type", {
			type: "string",
			description: "Specifies the desired compression algorithm and format.",
			choices: ["none", "gzip", "deflate"],
			default: "gzip",
		})
		.coerce("destination-compression-type", (value: string | undefined) =>
			resolveFileToken(value, "destination-compression-type", "text")
		)
		.option("destination-credentials-access-key-id", {
			type: "string",
			description: "Specifies the R2 Bucket Access Key Id.",
		})
		.option("destination-credentials-endpoint", {
			type: "string",
			description: "Specifies the R2 Endpoint.",
		})
		.option("destination-credentials-secret-access-key", {
			type: "string",
			description: "Specifies the R2 Bucket Secret Access Key.",
		})
		.option("destination-format", {
			type: "string",
			description: "Specifies the format of data to deliver.",
			choices: ["json"],
		})
		.coerce("destination-format", (value: string | undefined) =>
			resolveFileToken(value, "destination-format", "text")
		)
		.option("destination-path-bucket", {
			type: "string",
			description: "Specifies the R2 Bucket to store files.",
		})
		.option("destination-path-filepath", {
			type: "string",
			description: "Specifies the name pattern for directory.",
		})
		.option("destination-path-prefix", {
			type: "string",
			description: "Specifies the base directory within the bucket.",
		})
		.option("destination-type", {
			type: "string",
			description: "Specifies the type of destination.",
			choices: ["r2"],
		})
		.coerce("destination-type", (value: string | undefined) =>
			resolveFileToken(value, "destination-type", "text")
		)
		.option("name", {
			type: "string",
			description: "Defines the name of the pipeline.",
		})
		.option("source", {
			type: "string",
			description:
				"The source field. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request = SdkRequest<"postV4AccountsByAccount_idPipelines_deprecated">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "legacy-create",
	describe: "[DEPRECATED] Create Pipeline",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pipelines legacy-create",
				classification: {
					safeFlags: [
						"destination-compression-type",
						"destination-format",
						"destination-type",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pipelines legacy-create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destination: {
											batch: {
												max_bytes: argv["destination-batch-max-bytes"],
												max_duration_s:
													argv["destination-batch-max-duration-s"],
												max_rows: argv["destination-batch-max-rows"],
											},
											compression: {
												type: argv["destination-compression-type"],
											},
											credentials: {
												access_key_id: resolveFileToken(
													argv["destination-credentials-access-key-id"] as
														| string
														| undefined,
													"destination-credentials-access-key-id",
													"text"
												),
												endpoint: resolveFileToken(
													argv["destination-credentials-endpoint"] as
														| string
														| undefined,
													"destination-credentials-endpoint",
													"text"
												),
												secret_access_key: resolveFileToken(
													argv["destination-credentials-secret-access-key"] as
														| string
														| undefined,
													"destination-credentials-secret-access-key",
													"text"
												),
											},
											format: argv["destination-format"],
											path: {
												bucket: resolveFileToken(
													argv["destination-path-bucket"] as string | undefined,
													"destination-path-bucket",
													"text"
												),
												filepath: resolveFileToken(
													argv["destination-path-filepath"] as
														| string
														| undefined,
													"destination-path-filepath",
													"text"
												),
												prefix: resolveFileToken(
													argv["destination-path-prefix"] as string | undefined,
													"destination-path-prefix",
													"text"
												),
											},
											type: argv["destination-type"],
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										source: parseObjectArray(argv["source"], "source"),
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
						client.pipelines.legacyCreate({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["destination-credentials-access-key-id"] === undefined) {
					argv["destination-credentials-access-key-id"] =
						await promptForRequiredField(
							"destination-credentials-access-key-id",
							"Specifies the R2 Bucket Access Key Id."
						);
				}
				if (argv["destination-credentials-endpoint"] === undefined) {
					argv["destination-credentials-endpoint"] =
						await promptForRequiredField(
							"destination-credentials-endpoint",
							"Specifies the R2 Endpoint."
						);
				}
				if (argv["destination-credentials-secret-access-key"] === undefined) {
					argv["destination-credentials-secret-access-key"] =
						await promptForRequiredField(
							"destination-credentials-secret-access-key",
							"Specifies the R2 Bucket Secret Access Key."
						);
				}
				if (argv["destination-format"] === undefined) {
					argv["destination-format"] = await promptForRequiredEnumField(
						"destination-format",
						"Specifies the format of data to deliver.",
						["json"] as const
					);
				}
				if (argv["destination-path-bucket"] === undefined) {
					argv["destination-path-bucket"] = await promptForRequiredField(
						"destination-path-bucket",
						"Specifies the R2 Bucket to store files."
					);
				}
				if (argv["destination-type"] === undefined) {
					argv["destination-type"] = await promptForRequiredEnumField(
						"destination-type",
						"Specifies the type of destination.",
						["r2"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Defines the name of the pipeline."
					);
				}
				if (argv["source"] === undefined) {
					throw new Error(
						"--source is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					destination: {
						batch: {
							max_bytes: argv["destination-batch-max-bytes"],
							max_duration_s: argv["destination-batch-max-duration-s"],
							max_rows: argv["destination-batch-max-rows"],
						},
						compression: {
							type: argv["destination-compression-type"],
						},
						credentials: {
							access_key_id: resolveFileToken(
								argv["destination-credentials-access-key-id"] as
									| string
									| undefined,
								"destination-credentials-access-key-id",
								"text"
							),
							endpoint: resolveFileToken(
								argv["destination-credentials-endpoint"] as string | undefined,
								"destination-credentials-endpoint",
								"text"
							),
							secret_access_key: resolveFileToken(
								argv["destination-credentials-secret-access-key"] as
									| string
									| undefined,
								"destination-credentials-secret-access-key",
								"text"
							),
						},
						format: argv["destination-format"],
						path: {
							bucket: resolveFileToken(
								argv["destination-path-bucket"] as string | undefined,
								"destination-path-bucket",
								"text"
							),
							filepath: resolveFileToken(
								argv["destination-path-filepath"] as string | undefined,
								"destination-path-filepath",
								"text"
							),
							prefix: resolveFileToken(
								argv["destination-path-prefix"] as string | undefined,
								"destination-path-prefix",
								"text"
							),
						},
						type: argv["destination-type"],
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					source: parseObjectArray(argv["source"], "source"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.pipelines.legacyCreate({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
