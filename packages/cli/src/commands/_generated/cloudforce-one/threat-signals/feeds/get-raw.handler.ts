import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get-raw.js";
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
			command: "cloudforce-one threat-signals feeds get-raw",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				format: argv["format"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-signals feeds get-raw",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/feeds/${argv["feed-id"] == null ? "<feed-id>" : encodeURIComponent(String(argv["feed-id"]))}/raw`,
					pathParams: { "feed-id": String(argv["feed-id"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const qs = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([, v]) => v !== undefined)
					.map(([k, v]) => [k, String(v)])
			).toString();
			const __cfRawBytes = await withProgress(`Loading`, async () =>
				fetchRawBytes(
					`/accounts/${accountId}/cloudforce-one/v2/threat-signals/feeds/${encodeURIComponent(String(argv["feed-id"]))}/raw${qs ? "?" + qs : ""}`,
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
