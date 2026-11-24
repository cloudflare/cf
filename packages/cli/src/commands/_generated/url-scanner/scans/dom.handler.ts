import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./dom.js";
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
			command: "url-scanner scans dom",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf url-scanner scans dom",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/urlscanner/v2/dom/${argv["scan-id"] == null ? "<scan-id>" : encodeURIComponent(String(argv["scan-id"]))}`,
					pathParams: { "scan-id": String(argv["scan-id"] ?? "") },
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const __cfRawBytes = await withProgress(`Loading`, async () =>
				fetchRawBytes(
					`/accounts/${accountId}/urlscanner/v2/dom/${encodeURIComponent(String(argv["scan-id"]))}`,
					{
						method: "GET",
						local: argv.local === true,
						persistTo: argv.persistTo as string | undefined,
					}
				)
			);
			writeRawOutput(__cfRawBytes.toString("utf-8"));
			return;
		}
	);
}
