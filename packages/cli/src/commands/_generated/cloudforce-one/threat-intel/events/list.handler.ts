import operation from "../../../_operations/cloudforce-one/threat-intel/events/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
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
			command: "cloudforce-one threat-intel events list",
			classification: {
				safeFlags: ["order", "force-refresh", "format", "cache", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				cursor: argv["cursor"],
				search: argv["search"],
				searchBranches: argv["search-branches"],
				page: argv["page"],
				pageSize: argv["page-size"],
				orderBy: argv["order-by"],
				order: argv["order"],
				datasetId: argv["dataset-id"],
				forceRefresh: argv["force-refresh"],
				format: argv["format"],
				cache: argv["cache"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel events list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events`,
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
