import operation from "../../../_operations/cloudforce-one/threat-signals/articles/aggregate-severity.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./aggregate-severity.js";
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
			command: "cloudforce-one threat-signals articles aggregate-severity",
			classification: {
				safeFlags: ["read", "min-relevance", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				published_after: argv["published-after"],
				published_before: argv["published-before"],
				read: argv["read"],
				pir_id: argv["pir-id"],
				min_relevance: argv["min-relevance"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command:
						"cf cloudforce-one threat-signals articles aggregate-severity",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles/severity/aggregate`,
					pathParams: {},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { account_id: accountId, ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
