/**
 * list command
 * @generated from apis/overlays/r2.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List Bucket Jobs",
	usage:
		"$0 r2 buckets jobs list\n\nLists background jobs for an R2 bucket, including prefix-delete (and bucket-emptying) jobs and storage-class migration jobs. Jobs of every type are returned unless `jobType` is provided.",
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Name of the bucket.",
			parse: String,
		},
		"job-type": {
			kind: "enum",
			brief: "Restricts results to jobs of the specified type.",
			values: ["prefixDelete", "storageClassMigration"],
			optional: true,
		},
		status: {
			kind: "enum",
			brief:
				"Restricts results to jobs with the specified status. `jobType` is required when this parameter is provided.",
			values: ["ENQUEUED", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"],
			optional: true,
		},
		"max-keys": {
			kind: "parsed",
			brief: "Maximum number of jobs to return.",
			optional: true,
			parse: Number,
		},
		"continuation-token": {
			kind: "parsed",
			brief:
				"Pagination token received as `nextContinuationToken` in the previous response.",
			optional: true,
			parse: String,
		},
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets jobs list",
				classification: {
					safeFlags: ["job-type", "status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					jobType: argv["job-type"],
					status: argv["status"],
					maxKeys: argv["max-keys"],
					continuationToken: argv["continuation-token"],
				};

				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 buckets jobs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/jobs`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/jobs`,
						{
							query: queryParams,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
