import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 buckets sippy update <bucket-name>\n\nConfigures and enables Sippy on-demand migration for an R2 bucket. When a requested object is missing from R2, Sippy serves it from the configured source storage provider and copies it to R2."
		)
		.positional("bucket-name", {
			type: "string",
			description: "Name of the bucket.",
			demandOption: true,
		})
		.option("cf-r2-jurisdiction", {
			type: "string",
			description:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
		})
		.option("destination-access-key-id", {
			type: "string",
			description:
				'ID of a Cloudflare API token.\nThis is the value labelled "Access Key ID" when creating an API.\ntoken from the [R2 dashboard](https://dash.cloudflare.com/?to=/:account/r2/api-tokens).\n\nSippy will use this token when writing objects to R2, so it is\nbest to scope this token to the bucket you\'re enabling Sippy for.\n',
		})
		.option("destination-provider", {
			type: "string",
			description: "The destination.provider field",
			choices: ["r2"],
		})
		.coerce("destination-provider", (value: string | undefined) =>
			resolveFileToken(value, "destination-provider", "text")
		)
		.option("destination-secret-access-key", {
			type: "string",
			description:
				'Value of a Cloudflare API token.\nThis is the value labelled "Secret Access Key" when creating an API.\ntoken from the [R2 dashboard](https://dash.cloudflare.com/?to=/:account/r2/api-tokens).\n\nSippy will use this token when writing objects to R2, so it is\nbest to scope this token to the bucket you\'re enabling Sippy for.\n',
		})
		.option("source-access-key-id", {
			type: "string",
			description:
				"Access Key ID of an IAM credential (ideally scoped to a single S3 bucket).",
		})
		.option("source-bucket", {
			type: "string",
			description: "Name of the AWS S3 bucket.",
		})
		.option("source-provider", {
			type: "string",
			description: "The source.provider field",
			choices: ["aws", "gcs", "s3", "azure"],
		})
		.coerce("source-provider", (value: string | undefined) =>
			resolveFileToken(value, "source-provider", "text")
		)
		.option("source-region", {
			type: "string",
			description: "AWS region containing the source S3 bucket.",
		})
		.option("source-secret-access-key", {
			type: "string",
			description:
				"Secret Access Key of an IAM credential (ideally scoped to a single S3 bucket).",
		})
		.option("source-client-email", {
			type: "string",
			description:
				"Client email of an IAM credential (ideally scoped to a single GCS bucket).",
		})
		.option("source-private-key", {
			type: "string",
			description:
				"Private Key of an IAM credential (ideally scoped to a single GCS bucket).",
		})
		.option("source-bucket-url", {
			type: "string",
			description: "URL to the S3-compatible API of the bucket.",
		})
		.option("source-account-key", {
			type: "string",
			description:
				"Access key for the Azure Storage account. Mutually exclusive with sasToken.",
		})
		.option("source-account-name", {
			type: "string",
			description: "Name of the Azure Storage account.",
		})
		.option("source-container", {
			type: "string",
			description: "Name of the Azure Blob Storage container.",
		})
		.option("source-sas-token", {
			type: "string",
			description:
				"Shared Access Signature token for the Azure Storage account. Mutually exclusive with accountKey.",
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
		.conflicts("source-bucket", [
			"source-bucket-url",
			"source-account-key",
			"source-account-name",
			"source-container",
			"source-sas-token",
		])
		.conflicts("source-region", [
			"source-client-email",
			"source-private-key",
			"source-bucket-url",
			"source-account-key",
			"source-account-name",
			"source-container",
			"source-sas-token",
		])
		.conflicts("source-client-email", [
			"source-region",
			"source-bucket-url",
			"source-account-key",
			"source-account-name",
			"source-container",
			"source-sas-token",
		])
		.conflicts("source-private-key", [
			"source-region",
			"source-bucket-url",
			"source-account-key",
			"source-account-name",
			"source-container",
			"source-sas-token",
		])
		.conflicts("source-bucket-url", [
			"source-bucket",
			"source-region",
			"source-client-email",
			"source-private-key",
			"source-account-key",
			"source-account-name",
			"source-container",
			"source-sas-token",
		])
		.conflicts("source-account-key", [
			"source-bucket",
			"source-region",
			"source-client-email",
			"source-private-key",
			"source-bucket-url",
		])
		.conflicts("source-account-name", [
			"source-bucket",
			"source-region",
			"source-client-email",
			"source-private-key",
			"source-bucket-url",
		])
		.conflicts("source-container", [
			"source-bucket",
			"source-region",
			"source-client-email",
			"source-private-key",
			"source-bucket-url",
		])
		.conflicts("source-sas-token", [
			"source-bucket",
			"source-region",
			"source-client-email",
			"source-private-key",
			"source-bucket-url",
		]);
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <bucket-name>",
	describe: "Enable Sippy",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets sippy update",
				classification: {
					safeFlags: ["destination-provider", "source-provider", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 buckets sippy update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/sippy`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destination: {
											accessKeyId: resolveFileToken(
												argv["destination-access-key-id"] as string | undefined,
												"destination-access-key-id",
												"text"
											),
											provider: argv["destination-provider"],
											secretAccessKey: resolveFileToken(
												argv["destination-secret-access-key"] as
													| string
													| undefined,
												"destination-secret-access-key",
												"text"
											),
										},
										source: {
											accessKeyId: resolveFileToken(
												argv["source-access-key-id"] as string | undefined,
												"source-access-key-id",
												"text"
											),
											bucket: resolveFileToken(
												argv["source-bucket"] as string | undefined,
												"source-bucket",
												"text"
											),
											provider: argv["source-provider"],
											region: resolveFileToken(
												argv["source-region"] as string | undefined,
												"source-region",
												"text"
											),
											secretAccessKey: resolveFileToken(
												argv["source-secret-access-key"] as string | undefined,
												"source-secret-access-key",
												"text"
											),
											clientEmail: resolveFileToken(
												argv["source-client-email"] as string | undefined,
												"source-client-email",
												"text"
											),
											privateKey: resolveFileToken(
												argv["source-private-key"] as string | undefined,
												"source-private-key",
												"text"
											),
											bucketUrl: resolveFileToken(
												argv["source-bucket-url"] as string | undefined,
												"source-bucket-url",
												"text"
											),
											accountKey: resolveFileToken(
												argv["source-account-key"] as string | undefined,
												"source-account-key",
												"text"
											),
											accountName: resolveFileToken(
												argv["source-account-name"] as string | undefined,
												"source-account-name",
												"text"
											),
											container: resolveFileToken(
												argv["source-container"] as string | undefined,
												"source-container",
												"text"
											),
											sasToken: resolveFileToken(
												argv["source-sas-token"] as string | undefined,
												"source-sas-token",
												"text"
											),
										},
									}),
						sensitiveBodyPaths: [
							["destination", "secretAccessKey"],
							["source", "secretAccessKey"],
							["source", "privateKey"],
							["source", "accountKey"],
							["source", "sasToken"],
						],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/sippy`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["destination-access-key-id"] !== undefined)
					setNestedValue(
						bodyData,
						["destination", "accessKeyId"],
						resolveFileToken(
							argv["destination-access-key-id"] as string | undefined,
							"destination-access-key-id",
							"text"
						)
					);
				if (argv["destination-provider"] !== undefined)
					setNestedValue(
						bodyData,
						["destination", "provider"],
						argv["destination-provider"]
					);
				if (argv["destination-secret-access-key"] !== undefined)
					setNestedValue(
						bodyData,
						["destination", "secretAccessKey"],
						resolveFileToken(
							argv["destination-secret-access-key"] as string | undefined,
							"destination-secret-access-key",
							"text"
						)
					);
				if (argv["source-access-key-id"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "accessKeyId"],
						resolveFileToken(
							argv["source-access-key-id"] as string | undefined,
							"source-access-key-id",
							"text"
						)
					);
				if (argv["source-bucket"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "bucket"],
						resolveFileToken(
							argv["source-bucket"] as string | undefined,
							"source-bucket",
							"text"
						)
					);
				if (argv["source-provider"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "provider"],
						argv["source-provider"]
					);
				if (argv["source-region"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "region"],
						resolveFileToken(
							argv["source-region"] as string | undefined,
							"source-region",
							"text"
						)
					);
				if (argv["source-secret-access-key"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "secretAccessKey"],
						resolveFileToken(
							argv["source-secret-access-key"] as string | undefined,
							"source-secret-access-key",
							"text"
						)
					);
				if (argv["source-client-email"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "clientEmail"],
						resolveFileToken(
							argv["source-client-email"] as string | undefined,
							"source-client-email",
							"text"
						)
					);
				if (argv["source-private-key"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "privateKey"],
						resolveFileToken(
							argv["source-private-key"] as string | undefined,
							"source-private-key",
							"text"
						)
					);
				if (argv["source-bucket-url"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "bucketUrl"],
						resolveFileToken(
							argv["source-bucket-url"] as string | undefined,
							"source-bucket-url",
							"text"
						)
					);
				if (argv["source-account-key"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "accountKey"],
						resolveFileToken(
							argv["source-account-key"] as string | undefined,
							"source-account-key",
							"text"
						)
					);
				if (argv["source-account-name"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "accountName"],
						resolveFileToken(
							argv["source-account-name"] as string | undefined,
							"source-account-name",
							"text"
						)
					);
				if (argv["source-container"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "container"],
						resolveFileToken(
							argv["source-container"] as string | undefined,
							"source-container",
							"text"
						)
					);
				if (argv["source-sas-token"] !== undefined)
					setNestedValue(
						bodyData,
						["source", "sasToken"],
						resolveFileToken(
							argv["source-sas-token"] as string | undefined,
							"source-sas-token",
							"text"
						)
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/sippy`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
