import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
			command: "ai finetunes assets create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (
				argv.body === undefined &&
				argv.file === undefined &&
				argv["file-name"] === undefined
			) {
				throw new Error(
					"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
				);
			}
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai finetunes assets create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai/finetunes/${argv["finetune-id"] == null ? "<finetune-id>" : encodeURIComponent(String(argv["finetune-id"]))}/finetune-assets`,
					pathParams: { "finetune-id": String(argv["finetune-id"] ?? "") },
					bodyKind: "multipart",
					body: {
						body: argv["body"],
						file: argv["file"],
						"file-name": argv["file-name"],
					},
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (
				argv.file !== undefined ||
				argv.body !== undefined ||
				argv["file-name"] !== undefined
			) {
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
				if (argv["file-name"] !== undefined)
					formData.append(
						"file_name",
						String(
							resolveFileToken(
								argv["file-name"] as string | undefined,
								"file-name",
								"text"
							) ?? ""
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/ai/finetunes/${encodeURIComponent(String(argv["finetune-id"]))}/finetune-assets`,
						{ body: formData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			if (argv.body !== undefined) {
				// Endpoint does not accept application/json — send --body as raw bytes,
				// resolving @file references as binary file contents.
				const bodyData = resolveFileToken(argv.body, "body", "binary");
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/ai/finetunes/${encodeURIComponent(String(argv["finetune-id"]))}/finetune-assets`,
						{
							body: bodyData,
							headers: { "Content-Type": "multipart/form-data" },
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
		}
	);
}
