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
import { confirmDelete, promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 buckets storage-class-migration-jobs create <bucket-name>\n\nCreates a background job to migrate existing objects in an R2 bucket between storage classes. Provide both source and destination classes, or omit both to migrate from InfrequentAccess to Standard. Use the returned job ID with Get Storage Class Migration Job to inspect progress."
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
		.option("destination-storage-class", {
			type: "string",
			description:
				"Storage class to migrate objects to. Provide together with sourceStorageClass; the two classes must differ.",
			choices: ["Standard", "InfrequentAccess"],
		})
		.option("job-type", {
			type: "string",
			description: "The jobType field",
			choices: ["storageClassMigration"],
		})
		.option("source-storage-class", {
			type: "string",
			description:
				"Storage class to migrate objects from. Provide together with destinationStorageClass; the two classes must differ.",
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
			description:
				"Creates a storage-class migration background job. Direction fields must be provided together and must differ. Omitting both defaults to InfrequentAccess to Standard. ",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <bucket-name>",
	describe: "Create a Storage Class Migration Job",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets storage-class-migration-jobs create",
				classification: {
					safeFlags: [
						"destination-storage-class",
						"job-type",
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
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 buckets storage-class-migration-jobs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/storage-class-migration-jobs`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destinationStorageClass: resolveFileToken(
											argv["destination-storage-class"] as string | undefined,
											"destination-storage-class",
											"text"
										),
										jobType: resolveFileToken(
											argv["job-type"] as string | undefined,
											"job-type",
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
						message: `This starts a bucket-wide storage-class migration of existing R2 objects in the selected source storage class.`,
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
							`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/storage-class-migration-jobs`,
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
						["storageClassMigration"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
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
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/storage-class-migration-jobs`,
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
