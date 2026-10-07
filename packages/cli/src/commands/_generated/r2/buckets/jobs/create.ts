import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
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
import {
	confirmDelete,
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 r2 buckets jobs create <bucket-name>\n\nCreates a background job for an R2 bucket. The `jobType` field selects the job: - **`prefixDelete`**: deletes every object whose key begins with `prefix`. A non-empty prefix must end in `/`. An empty prefix (`""`) empties the entire bucket. - **`storageClassMigration`**: migrates every object in the bucket between storage classes. `sourceStorageClass` and `destinationStorageClass` must be provided together and must differ; omitting both migrates from `InfrequentAccess` to `Standard`. Poll the returned `id` with the Get Bucket Job endpoint. Small prefix-delete jobs can finish synchronously and return `COMPLETED`. Objects uploaded after a background job starts are not affected by that job. For prefix-delete jobs: abort active multipart uploads before submitting the request, since a synchronously completed job does not abort them, and avoid writing objects or starting multipart uploads while a bucket-emptying job is in progress. Each request creates a distinct job, and the number of active prefix-delete jobs is limited per bucket; wait for an existing job to finish before retrying a request rejected with HTTP 429. A bucket cannot be emptied while event notifications are configured (HTTP 409 / error code 10083). To protect a bucket with R2 Data Catalog enabled, send the `cf-r2-data-catalog-check` header; a conflict is returned with HTTP 409 / error code 10081. Prefix-delete jobs require permission to delete objects; storage-class migration jobs require permission to write to the bucket.'
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
		.option("cf-r2-data-catalog-check", {
			type: "string",
			description:
				"For prefix-delete jobs, set this header to reject the request when R2 Data Catalog is enabled for the bucket.",
		})
		.option("job-type", {
			type: "string",
			description: "The jobType field",
			choices: ["prefixDelete", "storageClassMigration"],
		})
		.option("prefix", {
			type: "string",
			description:
				"Prefix matched against object keys. A non-empty value must end in `/`.\nAn empty string empties the entire bucket.\n",
		})
		.option("destination-storage-class", {
			type: "string",
			description: "The destinationStorageClass field",
			choices: ["Standard", "InfrequentAccess"],
		})
		.option("source-storage-class", {
			type: "string",
			description: "The sourceStorageClass field",
			choices: ["Standard", "InfrequentAccess"],
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
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("prefix", ["destination-storage-class", "source-storage-class"])
		.conflicts("destination-storage-class", ["prefix"])
		.conflicts("source-storage-class", ["prefix"]);
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <bucket-name>",
	describe: "Create Bucket Job",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets jobs create",
				classification: {
					safeFlags: [
						"job-type",
						"destination-storage-class",
						"source-storage-class",
						"dry-run",
						"force",
					],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
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
						command: "cf r2 buckets jobs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/jobs`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										jobType: resolveFileToken(
											argv["job-type"] as string | undefined,
											"job-type",
											"text"
										),
										prefix: resolveFileToken(
											argv["prefix"] as string | undefined,
											"prefix",
											"text"
										),
										destinationStorageClass: resolveFileToken(
											argv["destination-storage-class"] as string | undefined,
											"destination-storage-class",
											"text"
										),
										sourceStorageClass: resolveFileToken(
											argv["source-storage-class"] as string | undefined,
											"source-storage-class",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This starts a background job that either permanently deletes every object under the given prefix (every object in the bucket for an empty prefix) or migrates every object in the bucket between storage classes.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/jobs`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
				if (argv["job-type"] === undefined) {
					argv["job-type"] = await promptForRequiredEnumField(
						"job-type",
						"The jobType field",
						["prefixDelete", "storageClassMigration"] as const
					);
				}

				if (
					argv["job-type"] === "prefixDelete" &&
					argv["prefix"] === undefined
				) {
					argv["prefix"] = await promptForRequiredField(
						"prefix",
						"Prefix matched against object keys. A non-empty value must end in \`/\`. An empty string empties the entire bucket. ",
						{ question: "Enter value for --prefix" }
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["job-type"] !== undefined)
					setNestedValue(
						bodyData,
						["jobType"],
						resolveFileToken(
							argv["job-type"] as string | undefined,
							"job-type",
							"text"
						)
					);
				if (argv["prefix"] !== undefined)
					setNestedValue(
						bodyData,
						["prefix"],
						resolveFileToken(
							argv["prefix"] as string | undefined,
							"prefix",
							"text"
						)
					);
				if (argv["destination-storage-class"] !== undefined)
					setNestedValue(
						bodyData,
						["destinationStorageClass"],
						resolveFileToken(
							argv["destination-storage-class"] as string | undefined,
							"destination-storage-class",
							"text"
						)
					);
				if (argv["source-storage-class"] !== undefined)
					setNestedValue(
						bodyData,
						["sourceStorageClass"],
						resolveFileToken(
							argv["source-storage-class"] as string | undefined,
							"source-storage-class",
							"text"
						)
					);
				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/jobs`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
