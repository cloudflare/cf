import operation from "../../_operations/brand-protection/queries/undismiss.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./undismiss.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "brand-protection queries undismiss",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf brand-protection queries undismiss",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/brand-protection/queries/${argv["query-id"] == null ? "<query-id>" : encodeURIComponent(String(argv["query-id"]))}/matches/${argv["domain-id"] == null ? "<domain-id>" : encodeURIComponent(String(argv["domain-id"]))}/undismiss`,
					pathParams: {
						"query-id": String(argv["query-id"] ?? ""),
						"domain-id": String(argv["domain-id"] ?? ""),
					},
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					account_id: accountId,
					query_id: argv["query-id"],
					domain_id: argv["domain-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
