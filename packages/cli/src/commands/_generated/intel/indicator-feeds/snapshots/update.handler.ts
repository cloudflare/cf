import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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
			command: "intel indicator-feeds snapshots update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["cf-async-upload"] !== undefined)
				headers["Cf-Async-Upload"] = String(argv["cf-async-upload"]);
			if (
				argv.body === undefined &&
				argv.file === undefined &&
				argv["source"] === undefined
			) {
				throw new Error(
					"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
				);
			}
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf intel indicator-feeds snapshots update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/indicator-feeds/${argv["feed-id"] == null ? "<feed-id>" : encodeURIComponent(String(argv["feed-id"]))}/snapshot`,
					pathParams: { "feed-id": String(argv["feed-id"] ?? "") },
					bodyKind: "multipart",
					body: {
						body: argv["body"],
						file: argv["file"],
						source: argv["source"],
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
				argv["source"] !== undefined
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
				if (argv["source"] !== undefined)
					formData.append(
						"source",
						String(
							resolveFileToken(
								argv["source"] as string | undefined,
								"source",
								"text"
							) ?? ""
						)
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/intel/indicator-feeds/${encodeURIComponent(String(argv["feed-id"]))}/snapshot`,
						{
							body: formData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
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
						`/accounts/${accountId}/intel/indicator-feeds/${encodeURIComponent(String(argv["feed-id"]))}/snapshot`,
						{
							body: bodyData,
							headers: { "Content-Type": "multipart/form-data", ...headers },
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
		}
	);
}
