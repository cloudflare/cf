/**
 * delete command
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <object-key>",
	describe: "Delete Object",
	usage:
		"$0 r2 objects delete <object-key>\n\nDeletes an object from an R2 bucket. For most workloads, we recommend using R2's [S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/) or a [Worker with an R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) instead.",
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Name of the bucket.",
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "object-key",
			brief:
				"The key (name) of the object to delete. May contain slashes for path-like keys. Slashes (\`/\`) within the key MUST be sent literally and MUST NOT be percent-encoded (i.e. \`%2F\`); other reserved characters should be percent-encoded as usual.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 objects delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 objects delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/objects/${argv["object-key"] == null ? "<object-key>" : encodeURIComponent(String(argv["object-key"]))}`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							"object-key": String(argv["object-key"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This permanently deletes the specified object from the R2 bucket.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"DELETE",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/objects/${encodeURIComponent(String(argv["object-key"]))}`,
						{ headers: Object.keys(headers).length > 0 ? headers : undefined }
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
