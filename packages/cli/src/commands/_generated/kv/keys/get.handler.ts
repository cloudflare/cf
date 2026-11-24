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
			command: "kv keys get",
			classification: {
				safeFlags: ["dry-run", "text"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf kv keys get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/values/${argv["key-name"] == null ? "<key-name>" : encodeURIComponent(String(argv["key-name"]))}`,
					pathParams: {
						"namespace-id": String(argv["namespace-id"] ?? ""),
						"key-name": String(argv["key-name"] ?? ""),
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
					`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/values/${encodeURIComponent(String(argv["key-name"]))}`,
					{
						method: "GET",
						local: argv.local === true,
						persistTo: argv.persistTo as string | undefined,
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
