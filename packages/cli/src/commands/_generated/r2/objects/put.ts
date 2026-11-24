/**
 * put command
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
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "put <object-key>",
	describe: "Upload Object",
	usage:
		"$0 r2 objects put <object-key>\n\nUploads an object to an R2 bucket. The object body is provided as the request body. Returns metadata about the uploaded object. The maximum upload size for this endpoint is 300 MB. For most workloads, we recommend using R2's [S3-compatible API](https://developers.cloudflare.com/r2/api/s3/api/) or a [Worker with an R2 binding](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/) instead.",
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
		"content-type": {
			kind: "parsed",
			brief: "The MIME type of the object being uploaded.",
			optional: true,
			parse: String,
		},
		"content-length": {
			kind: "parsed",
			brief: "The size of the object body in bytes.",
			optional: true,
			parse: String,
		},
		"cf-r2-storage-class": {
			kind: "parsed",
			brief: "Storage class for this object. Overrides the bucket default.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "The object body to upload.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "object-key",
			brief:
				"The key (name) to assign to the object. May contain slashes for path-like keys. Slashes (\`/\`) within the key MUST be sent literally and MUST NOT be percent-encoded (i.e. \`%2F\`); other reserved characters should be percent-encoded as usual.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 objects put",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv["content-type"] !== undefined)
					headers["Content-Type"] = String(argv["content-type"]);
				if (argv["content-length"] !== undefined)
					headers["Content-Length"] = String(argv["content-length"]);
				if (argv["cf-r2-storage-class"] !== undefined)
					headers["cf-r2-storage-class"] = String(argv["cf-r2-storage-class"]);
				if (argv.body === undefined && argv.file === undefined) {
					throw new Error(
						"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
					);
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 objects put",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/objects/${argv["object-key"] == null ? "<object-key>" : encodeURIComponent(String(argv["object-key"]))}`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							"object-key": String(argv["object-key"] ?? ""),
						},
						bodyKind: "octet-stream",
						body: argv.file !== undefined ? { file: argv.file } : argv.body,
					});
					return;
				}
				const parsedBody =
					argv.file !== undefined
						? undefined
						: resolveFileToken(argv.body, "body", "binary");
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/objects/${encodeURIComponent(String(argv["object-key"]))}`,
							{
								body: fileContent,
								headers: {
									"Content-Type": "application/octet-stream",
									...(Object.keys(headers).length > 0 ? headers : undefined),
								},
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/objects/${encodeURIComponent(String(argv["object-key"]))}`,
							{
								body: bodyData,
								headers: {
									"Content-Type": "application/octet-stream",
									...headers,
								},
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
			}
		),
});

export default command;
