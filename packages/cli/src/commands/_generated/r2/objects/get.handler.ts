import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "r2 objects get",
			classification: {
				safeFlags: ["dry-run", "text"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["cf-r2-jurisdiction"] !== undefined)
				headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
			if (argv["if-none-match"] !== undefined)
				headers["If-None-Match"] = String(argv["if-none-match"]);
			if (argv["if-modified-since"] !== undefined)
				headers["If-Modified-Since"] = String(argv["if-modified-since"]);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf r2 objects get",
					method: "GET",
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

			const __cfRawBytes = await withProgress(`Loading`, async () =>
				fetchRawBytes(
					`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/objects/${encodeURIComponent(String(argv["object-key"]))}`,
					{
						method: "GET",
						local: argv.local === true,
						persistTo: argv.persistTo as string | undefined,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			writeRawOutput(
				argv.text === true ? __cfRawBytes.toString("utf-8") : __cfRawBytes
			);
			return;
		}
	);
}
