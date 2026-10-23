import operation from "../../../_operations/cloudforce-one/threat-intel/events/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-intel events list\n\nLists events, with filters passed as query parameters. `datasetId` accepts dataset UUIDs or one scope value used alone: `all` (or `*`) and `operational` select the intelligence datasets you can read, and `analytics` selects the analytics datasets you can read. A scope value covers at most 50 datasets. Without `datasetId`, the default Cloudforce One Threat Events dataset is used. To send filters in a JSON body instead, use `threat-intel events search`."
		)
		.option("cursor", {
			type: "string",
			description:
				"Cursor for pagination. When provided, filters are embedded in the cursor so you only need to pass cursor and pageSize. Returned in the previous response's result_info.cursor field. Use cursor-based pagination for deep pagination (beyond 100,000 records) or for optimal performance.",
		})
		.option("search", { type: "string", description: "Search" })
		.option("search-branches", {
			type: "string",
			description:
				"JSON-encoded. OR branches of structured search filters. Filters within a branch are AND'd, branches are OR'd, and the result is AND'd with `search`: `AND(search) AND OR(AND(branch 1), ...)`. Max 8 branches of 1-10 conditions each. Not supported for analytics datasets, and `indicator` filters are not yet supported inside branches. Cursor pages carry the original branches, so do not resend them with `cursor`.",
		})
		.option("page", {
			type: "number",
			description:
				"Page number (1-indexed) for offset-based pagination. Limited to offset of 100,000 records. For deep pagination, use cursor-based pagination instead.",
		})
		.option("page-size", {
			type: "number",
			description: "Number of results per page. Maximum 25,000.",
		})
		.option("order-by", { type: "string", description: "OrderBy" })
		.option("order", {
			type: "string",
			description: "Order",
			choices: ["asc", "desc"],
		})
		.option("dataset-id", {
			type: "string",
			description:
				"Dataset UUIDs to query, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Scope values query at most 50 datasets. If not provided, uses the default dataset.",
		})
		.option("force-refresh", { type: "boolean", description: "ForceRefresh" })
		.option("format", {
			type: "string",
			description: "Format",
			choices: ["json", "stix2", "taxii"],
		})
		.option("cache", {
			type: "string",
			description:
				"Cache strategy. 'from-graph' serves results from the graph-node KV cache when all requested UUIDs are cached; falls back to normal path on partial/zero hit.",
			choices: ["from-graph"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events list",
				classification: {
					safeFlags: ["order", "force-refresh", "format", "cache", "dry-run"],
				} satisfies ArgClassification<Args>,
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
		),
};

export default command;
