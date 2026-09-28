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
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 super-slurper jobs create\n\nCreates a new R2 Super Slurper migration job to transfer objects from a source bucket (e.g. S3, GCS, R2) to R2."
		)
		.option("overwrite", {
			type: "boolean",
			description: "The overwrite field",
			default: true,
		})
		.option("source-bucket", {
			type: "string",
			description: "The source.bucket field",
		})
		.option("source-endpoint", {
			type: "string",
			description: "Custom S3-compatible endpoint that must use https://.",
		})
		.option("source-keys", {
			type: "string",
			array: true,
			description: "The source.keys field",
		})
		.option("source-path-prefix", {
			type: "string",
			description: "The source.pathPrefix field",
		})
		.option("source-region", {
			type: "string",
			description: "The source.region field",
		})
		.option("source-secret-access-key-id", {
			type: "string",
			description: "The source.secret.accessKeyId field",
		})
		.option("source-secret-secret-access-key", {
			type: "string",
			description: "The source.secret.secretAccessKey field",
		})
		.option("source-secret-client-email", {
			type: "string",
			description: "The source.secret.clientEmail field",
		})
		.option("source-secret-private-key", {
			type: "string",
			description: "The source.secret.privateKey field",
		})
		.option("source-vendor", {
			type: "string",
			description: "The source.vendor field",
			choices: ["s3", "gcs", "r2"],
		})
		.option("source-jurisdiction", {
			type: "string",
			description: "The source.jurisdiction field",
			choices: ["default", "eu", "us", "fedramp"],
		})
		.option("target-bucket", {
			type: "string",
			description: "The target.bucket field",
		})
		.option("target-jurisdiction", {
			type: "string",
			description: "The target.jurisdiction field",
			choices: ["default", "eu", "us", "fedramp"],
		})
		.option("target-secret-access-key-id", {
			type: "string",
			description: "The target.secret.accessKeyId field",
		})
		.option("target-secret-secret-access-key", {
			type: "string",
			description: "The target.secret.secretAccessKey field",
		})
		.option("target-vendor", {
			type: "string",
			description: "The target.vendor field",
			choices: ["r2"],
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
		.conflicts("source-endpoint", [
			"source-secret-client-email",
			"source-secret-private-key",
			"source-jurisdiction",
		])
		.conflicts("source-region", [
			"source-secret-client-email",
			"source-secret-private-key",
			"source-jurisdiction",
		])
		.conflicts("source-secret-access-key-id", [
			"source-secret-client-email",
			"source-secret-private-key",
		])
		.conflicts("source-secret-secret-access-key", [
			"source-secret-client-email",
			"source-secret-private-key",
		])
		.conflicts("source-secret-client-email", [
			"source-endpoint",
			"source-region",
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
			"source-jurisdiction",
		])
		.conflicts("source-secret-private-key", [
			"source-endpoint",
			"source-region",
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
			"source-jurisdiction",
		])
		.conflicts("source-jurisdiction", [
			"source-endpoint",
			"source-region",
			"source-secret-client-email",
			"source-secret-private-key",
		])
		.check((argv) => {
			const groupSet = [
				"source-bucket",
				"source-endpoint",
				"source-keys",
				"source-path-prefix",
				"source-region",
				"source-secret-access-key-id",
				"source-secret-secret-access-key",
				"source-secret-client-email",
				"source-secret-private-key",
				"source-vendor",
				"source-jurisdiction",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["source-bucket", "source-vendor"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --source-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"target-bucket",
				"target-jurisdiction",
				"target-secret-access-key-id",
				"target-secret-secret-access-key",
				"target-vendor",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"target-bucket",
					"target-secret-access-key-id",
					"target-secret-secret-access-key",
					"target-vendor",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --target-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"slurper-create-job">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a job",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 super-slurper jobs create",
				classification: {
					safeFlags: [
						"overwrite",
						"source-vendor",
						"source-jurisdiction",
						"target-jurisdiction",
						"target-vendor",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 super-slurper jobs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/slurper/jobs`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										overwrite: argv["overwrite"],
										source: {
											bucket: resolveFileToken(
												argv["source-bucket"] as string | undefined,
												"source-bucket",
												"text"
											),
											endpoint: resolveFileToken(
												argv["source-endpoint"] as string | undefined,
												"source-endpoint",
												"text"
											),
											keys: argv["source-keys"],
											pathPrefix: resolveFileToken(
												argv["source-path-prefix"] as string | undefined,
												"source-path-prefix",
												"text"
											),
											region: resolveFileToken(
												argv["source-region"] as string | undefined,
												"source-region",
												"text"
											),
											secret: {
												accessKeyId: resolveFileToken(
													argv["source-secret-access-key-id"] as
														| string
														| undefined,
													"source-secret-access-key-id",
													"text"
												),
												secretAccessKey: resolveFileToken(
													argv["source-secret-secret-access-key"] as
														| string
														| undefined,
													"source-secret-secret-access-key",
													"text"
												),
												clientEmail: resolveFileToken(
													argv["source-secret-client-email"] as
														| string
														| undefined,
													"source-secret-client-email",
													"text"
												),
												privateKey: resolveFileToken(
													argv["source-secret-private-key"] as
														| string
														| undefined,
													"source-secret-private-key",
													"text"
												),
											},
											vendor: resolveFileToken(
												argv["source-vendor"] as string | undefined,
												"source-vendor",
												"text"
											),
											jurisdiction: resolveFileToken(
												argv["source-jurisdiction"] as string | undefined,
												"source-jurisdiction",
												"text"
											),
										},
										target: {
											bucket: resolveFileToken(
												argv["target-bucket"] as string | undefined,
												"target-bucket",
												"text"
											),
											jurisdiction: resolveFileToken(
												argv["target-jurisdiction"] as string | undefined,
												"target-jurisdiction",
												"text"
											),
											secret: {
												accessKeyId: resolveFileToken(
													argv["target-secret-access-key-id"] as
														| string
														| undefined,
													"target-secret-access-key-id",
													"text"
												),
												secretAccessKey: resolveFileToken(
													argv["target-secret-secret-access-key"] as
														| string
														| undefined,
													"target-secret-secret-access-key",
													"text"
												),
											},
											vendor: resolveFileToken(
												argv["target-vendor"] as string | undefined,
												"target-vendor",
												"text"
											),
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
						client.r2.superSlurper.jobs.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					overwrite: argv["overwrite"],
					source: {
						bucket: resolveFileToken(
							argv["source-bucket"] as string | undefined,
							"source-bucket",
							"text"
						),
						endpoint: resolveFileToken(
							argv["source-endpoint"] as string | undefined,
							"source-endpoint",
							"text"
						),
						keys: argv["source-keys"],
						pathPrefix: resolveFileToken(
							argv["source-path-prefix"] as string | undefined,
							"source-path-prefix",
							"text"
						),
						region: resolveFileToken(
							argv["source-region"] as string | undefined,
							"source-region",
							"text"
						),
						secret: {
							accessKeyId: resolveFileToken(
								argv["source-secret-access-key-id"] as string | undefined,
								"source-secret-access-key-id",
								"text"
							),
							secretAccessKey: resolveFileToken(
								argv["source-secret-secret-access-key"] as string | undefined,
								"source-secret-secret-access-key",
								"text"
							),
							clientEmail: resolveFileToken(
								argv["source-secret-client-email"] as string | undefined,
								"source-secret-client-email",
								"text"
							),
							privateKey: resolveFileToken(
								argv["source-secret-private-key"] as string | undefined,
								"source-secret-private-key",
								"text"
							),
						},
						vendor: resolveFileToken(
							argv["source-vendor"] as string | undefined,
							"source-vendor",
							"text"
						),
						jurisdiction: resolveFileToken(
							argv["source-jurisdiction"] as string | undefined,
							"source-jurisdiction",
							"text"
						),
					},
					target: {
						bucket: resolveFileToken(
							argv["target-bucket"] as string | undefined,
							"target-bucket",
							"text"
						),
						jurisdiction: resolveFileToken(
							argv["target-jurisdiction"] as string | undefined,
							"target-jurisdiction",
							"text"
						),
						secret: {
							accessKeyId: resolveFileToken(
								argv["target-secret-access-key-id"] as string | undefined,
								"target-secret-access-key-id",
								"text"
							),
							secretAccessKey: resolveFileToken(
								argv["target-secret-secret-access-key"] as string | undefined,
								"target-secret-secret-access-key",
								"text"
							),
						},
						vendor: resolveFileToken(
							argv["target-vendor"] as string | undefined,
							"target-vendor",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.r2.superSlurper.jobs.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
