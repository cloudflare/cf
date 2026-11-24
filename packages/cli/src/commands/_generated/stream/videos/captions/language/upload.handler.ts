import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./upload.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "stream videos captions language upload",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.body === undefined && argv.file === undefined) {
				throw new Error(
					"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
				);
			}
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf stream videos captions language upload",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/captions/${argv["language"] == null ? "<language>" : encodeURIComponent(String(argv["language"]))}`,
					pathParams: {
						identifier: String(argv["identifier"] ?? ""),
						language: String(argv["language"] ?? ""),
					},
					bodyKind: "multipart",
					body: { body: argv["body"], file: argv["file"] },
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.file !== undefined || argv.body !== undefined) {
				const formData = new FormData();
				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					formData.append(
						"file",
						new Blob([fileContent]),
						argv.file.split(/[\\/]/).filter(Boolean).pop()
					);
				} else if (argv.body !== undefined) {
					formData.append("file", argv.body);
				}
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/stream/${encodeURIComponent(String(argv["identifier"]))}/captions/${encodeURIComponent(String(argv["language"]))}`,
						{ body: formData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			if (argv.body !== undefined) {
				// Endpoint does not accept application/json — send --body as raw bytes,
				// resolving @file references as binary file contents.
				const bodyData = resolveFileToken(argv.body, "body", "binary");
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/stream/${encodeURIComponent(String(argv["identifier"]))}/captions/${encodeURIComponent(String(argv["language"]))}`,
						{
							body: bodyData,
							headers: { "Content-Type": "multipart/form-data" },
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
		}
	);
}
