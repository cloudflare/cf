import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * bulk-delete command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 objects bulk-delete\n\nDeletes the listed objects from an R2 bucket. Provide a JSON array of 1 to 1000 object keys in the request body. If any key cannot be deleted (for example, because it does not exist or is locked), the remaining keys are still deleted, but the response is HTTP 200 with `success: false`, `result: null` and one entry in `errors` per failed key. The entries in `errors` do not identify which key failed. To delete every object under a prefix, or to empty a bucket, create a `prefixDelete` job with the Create Bucket Job endpoint instead. The `prefix` query parameter on this endpoint is deprecated; it creates the same job, but responses to it carry a `Deprecation` header and a message pointing to Create Bucket Job. For most workloads, we recommend using R2's [S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/) or a [Worker with an R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) instead."
		)
		.option("bucket-name", {
			type: "string",
			description: "Name of the bucket.",
			demandOption: true,
		})
		.option("prefix", {
			type: "string",
			description:
				"Deprecated. Create a `prefixDelete` job with the Create Bucket Job endpoint instead.\nWhen present, the request body is ignored and a prefix-delete job is created for this\nprefix, exactly as Create Bucket Job does; an empty value empties the bucket. The\nresponse is the job descriptor, with a `Deprecation` header and a deprecation message\nin `messages`.",
		})
		.option("cf-r2-jurisdiction", {
			type: "string",
			description:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
		})
		.option("cf-r2-data-catalog-check", {
			type: "string",
			description:
				"Set this header to reject the operation when R2 Data Catalog is enabled for the bucket.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"A JSON array of 1 to 1000 object keys to delete. Required unless the deprecated \`prefix\` parameter is present.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "bulk-delete",
	describe: "Delete Objects",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 objects bulk-delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					prefix: argv["prefix"],
				};

				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv["cf-r2-data-catalog-check"] !== undefined)
					headers["cf-r2-data-catalog-check"] = String(
						argv["cf-r2-data-catalog-check"]
					);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 objects bulk-delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/objects`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						query: queryParams,
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This permanently deletes the listed R2 objects. With the deprecated \`prefix\` parameter it deletes every object under that prefix, and an empty prefix empties the bucket.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					if (Array.isArray(bodyData) && bodyData.length > 1000) {
						const total = Math.ceil(bodyData.length / 1000);
						let result: unknown = null;
						for (let i = 0; i < bodyData.length; i += 1000) {
							const batch = bodyData.slice(i, i + 1000);
							const batchNum = Math.floor(i / 1000) + 1;
							result = await withProgress(
								`Deleting: batch ${batchNum}/${total}`,
								async () =>
									requestApi<unknown>(
										client,
										"DELETE",
										`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/objects${qs ? "?" + qs : ""}`,
										{
											body: batch,
											headers:
												Object.keys(headers).length > 0 ? headers : undefined,
										}
									)
							);
						}
						formatOutput(result, { successLabel: `Deleted` });
						return;
					}
					const result = await withProgress(`Deleting`, async () =>
						requestApi<unknown>(
							client,
							"DELETE",
							`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/objects${qs ? "?" + qs : ""}`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
