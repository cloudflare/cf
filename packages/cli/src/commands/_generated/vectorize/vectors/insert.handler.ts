import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./insert.js";
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
			command: "vectorize vectors insert",
			classification: {
				safeFlags: ["unparsable-behavior", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				"unparsable-behavior": argv["unparsable-behavior"],
			};
			if (argv.body === undefined && argv.file === undefined) {
				throw new Error(
					"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
				);
			}
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf vectorize vectors insert",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/vectorize/v2/indexes/${argv["index-name"] == null ? "<index-name>" : encodeURIComponent(String(argv["index-name"]))}/insert`,
					pathParams: { "index-name": String(argv["index-name"] ?? "") },
					query: queryParams,
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
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/vectorize/v2/indexes/${encodeURIComponent(String(argv["index-name"]))}/insert`,
						{
							body: fileContent,
							headers: { "Content-Type": "application/x-ndjson" },
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const qs = new URLSearchParams(
					Object.entries(queryParams)
						.filter(([, v]) => v !== undefined)
						.map(([k, v]) => [k, String(v)])
				).toString();
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/vectorize/v2/indexes/${encodeURIComponent(String(argv["index-name"]))}/insert${qs ? "?" + qs : ""}`,
						{
							body: bodyData,
							headers: { "Content-Type": "application/x-ndjson" },
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
		}
	);
}
