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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * bulk-delete command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 objects bulk-delete\n\nDeletes objects from an R2 bucket. Three modes are supported: 1. **Delete by list** (default): Provide a JSON array of object keys in the request body. All listed objects are deleted; per-key errors are reported in the response. 2. **Delete by prefix**: Provide a non-empty `prefix` query parameter and no request body to delete every object whose key begins with that prefix. 3. **Empty bucket**: Provide the `prefix` query parameter with an empty value (`?prefix=`) and no request body to delete all objects in the bucket. Prefix and empty-bucket requests return a job descriptor. Small jobs can finish synchronously and return `COMPLETED`; larger jobs continue in the background. Poll the returned `id` with the Get Bucket Job endpoint. Objects uploaded after a background job starts are not deleted by that job. Abort active multipart uploads before submitting the request; a synchronously completed job does not abort them. Avoid writing objects or starting multipart uploads while a bucket-emptying job is in progress. Each repeated or concurrent request creates a distinct job. The number of active jobs is limited per bucket; wait for an existing job to finish before retrying a request rejected with HTTP 429. A bucket cannot be emptied while event notifications are configured. Remove the event notification rules and retry requests rejected with HTTP 409 / error code 10034. To protect a bucket with R2 Data Catalog enabled, send the `cf-r2-data-catalog-check` header; a conflict is returned with HTTP 409 / error code 10081. For most workloads, we recommend using R2's [S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/) or a [Worker with an R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) instead."
		)
		.option("bucket-name", {
			type: "string",
			description: "Name of the bucket.",
			demandOption: true,
		})
		.option("prefix", {
			type: "string",
			description:
				"When present, switches the operation to prefix-delete mode. A non-empty value must\nend in `/` and deletes keys beginning with that prefix. Preserve an empty value\n(`?prefix=`) to empty the entire bucket. Omitting this parameter instead selects\ndelete-by-list mode and requires a JSON request body.",
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
				'Required for "delete by list" mode (when \`prefix\` query parameter is omitted). A JSON array of object keys to delete. Ignored when \`prefix\` is provided. ',
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "bulk-delete",
	describe: "Delete Objects or Empty a Bucket",
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
						message: `This permanently deletes the selected R2 objects. An explicitly empty prefix deletes every object in the bucket while retaining the bucket itself.`,
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
