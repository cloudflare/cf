import operation from "../../../_operations/cloudforce-one/threat-signals/articles/list.js";
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
			command: "cloudforce-one threat-signals articles list",
			classification: {
				safeFlags: [
					"read",
					"include-total",
					"source-type",
					"tag-applied-by",
					"min-relevance",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				cursor: argv["cursor"],
				per_page: argv["per-page"],
				feed_id: argv["feed-id"],
				article_id: argv["article-id"],
				read: argv["read"],
				tag_id: argv["tag-id"],
				tag_category_id: argv["tag-category-id"],
				tag: argv["tag"],
				tag_category: argv["tag-category"],
				include_total: argv["include-total"],
				search: argv["search"],
				published_after: argv["published-after"],
				published_before: argv["published-before"],
				fetched_after: argv["fetched-after"],
				fetched_before: argv["fetched-before"],
				feed_category: argv["feed-category"],
				source_type: argv["source-type"],
				tag_applied_by: argv["tag-applied-by"],
				pir_id: argv["pir-id"],
				min_relevance: argv["min-relevance"],
				severity: argv["severity"],
				sort: argv["sort"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-signals articles list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/articles`,
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
