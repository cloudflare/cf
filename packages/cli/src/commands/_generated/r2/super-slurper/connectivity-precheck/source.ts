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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * source command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 super-slurper connectivity-precheck source\n\nCheck whether tokens are valid against the source bucket"
		)
		.option("bucket", { type: "string", description: "The bucket field" })
		.option("endpoint", {
			type: "string",
			description: "Custom S3-compatible endpoint that must use https://.",
		})
		.option("keys", {
			type: "string",
			array: true,
			description: "The keys field",
		})
		.option("path-prefix", {
			type: "string",
			description: "The pathPrefix field",
		})
		.option("region", { type: "string", description: "The region field" })
		.option("secret-access-key-id", {
			type: "string",
			description: "The secret.accessKeyId field",
		})
		.option("secret-secret-access-key", {
			type: "string",
			description: "The secret.secretAccessKey field",
		})
		.option("secret-client-email", {
			type: "string",
			description: "The secret.clientEmail field",
		})
		.option("secret-private-key", {
			type: "string",
			description: "The secret.privateKey field",
		})
		.option("vendor", {
			type: "string",
			description: "The vendor field",
			choices: ["s3", "gcs", "r2"],
		})
		.option("jurisdiction", {
			type: "string",
			description: "The jurisdiction field",
			choices: ["default", "eu", "us", "fedramp"],
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
		.conflicts("endpoint", [
			"secret-client-email",
			"secret-private-key",
			"jurisdiction",
		])
		.conflicts("region", [
			"secret-client-email",
			"secret-private-key",
			"jurisdiction",
		])
		.conflicts("secret-access-key-id", [
			"secret-client-email",
			"secret-private-key",
		])
		.conflicts("secret-secret-access-key", [
			"secret-client-email",
			"secret-private-key",
		])
		.conflicts("secret-client-email", [
			"endpoint",
			"region",
			"secret-access-key-id",
			"secret-secret-access-key",
			"jurisdiction",
		])
		.conflicts("secret-private-key", [
			"endpoint",
			"region",
			"secret-access-key-id",
			"secret-secret-access-key",
			"jurisdiction",
		])
		.conflicts("jurisdiction", [
			"endpoint",
			"region",
			"secret-client-email",
			"secret-private-key",
		]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"slurper-check-source-connectivity">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "source",
	describe: "Check source connectivity",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 super-slurper connectivity-precheck source",
				classification: {
					safeFlags: ["vendor", "jurisdiction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 super-slurper connectivity-precheck source",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/slurper/source/connectivity-precheck`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bucket: resolveFileToken(
											argv["bucket"] as string | undefined,
											"bucket",
											"text"
										),
										endpoint: resolveFileToken(
											argv["endpoint"] as string | undefined,
											"endpoint",
											"text"
										),
										keys: argv["keys"],
										pathPrefix: resolveFileToken(
											argv["path-prefix"] as string | undefined,
											"path-prefix",
											"text"
										),
										region: resolveFileToken(
											argv["region"] as string | undefined,
											"region",
											"text"
										),
										secret: {
											accessKeyId: resolveFileToken(
												argv["secret-access-key-id"] as string | undefined,
												"secret-access-key-id",
												"text"
											),
											secretAccessKey: resolveFileToken(
												argv["secret-secret-access-key"] as string | undefined,
												"secret-secret-access-key",
												"text"
											),
											clientEmail: resolveFileToken(
												argv["secret-client-email"] as string | undefined,
												"secret-client-email",
												"text"
											),
											privateKey: resolveFileToken(
												argv["secret-private-key"] as string | undefined,
												"secret-private-key",
												"text"
											),
										},
										vendor: resolveFileToken(
											argv["vendor"] as string | undefined,
											"vendor",
											"text"
										),
										jurisdiction: resolveFileToken(
											argv["jurisdiction"] as string | undefined,
											"jurisdiction",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.r2.superSlurper.connectivityPrecheck.source({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["bucket"] === undefined) {
					argv["bucket"] = await promptForRequiredField(
						"bucket",
						"The bucket field"
					);
				}
				if (argv["vendor"] === undefined) {
					argv["vendor"] = await promptForRequiredEnumField(
						"vendor",
						"The vendor field",
						["s3", "gcs", "r2"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					bucket: resolveFileToken(
						argv["bucket"] as string | undefined,
						"bucket",
						"text"
					),
					endpoint: resolveFileToken(
						argv["endpoint"] as string | undefined,
						"endpoint",
						"text"
					),
					keys: argv["keys"],
					pathPrefix: resolveFileToken(
						argv["path-prefix"] as string | undefined,
						"path-prefix",
						"text"
					),
					region: resolveFileToken(
						argv["region"] as string | undefined,
						"region",
						"text"
					),
					secret: {
						accessKeyId: resolveFileToken(
							argv["secret-access-key-id"] as string | undefined,
							"secret-access-key-id",
							"text"
						),
						secretAccessKey: resolveFileToken(
							argv["secret-secret-access-key"] as string | undefined,
							"secret-secret-access-key",
							"text"
						),
						clientEmail: resolveFileToken(
							argv["secret-client-email"] as string | undefined,
							"secret-client-email",
							"text"
						),
						privateKey: resolveFileToken(
							argv["secret-private-key"] as string | undefined,
							"secret-private-key",
							"text"
						),
					},
					vendor: resolveFileToken(
						argv["vendor"] as string | undefined,
						"vendor",
						"text"
					),
					jurisdiction: resolveFileToken(
						argv["jurisdiction"] as string | undefined,
						"jurisdiction",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.r2.superSlurper.connectivityPrecheck.source({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
