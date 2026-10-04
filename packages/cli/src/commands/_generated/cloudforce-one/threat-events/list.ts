import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
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
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one threat-events list\n\nUse `datasetId=all` or `datasetId=*` for the legacy all-datasets scope, `datasetId=analytics` for datasets with `isAnalytics=true`, or `datasetId=operational` for datasets with `isAnalytics=false` (limited to 50). Scope values must be used alone. When `datasetId` is unspecified, events are listed from the default Cloudforce One Threat Events dataset. To list existing datasets, use the [`List Datasets`](https://developers.cloudflare.com/api/resources/cloudforce_one/subresources/threat_events/subresources/datasets/methods/list/) endpoint."
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
				"Dataset UUIDs to query, or one standalone scope value: 'all'/'*' for the legacy all-datasets behavior, 'analytics' for isAnalytics=true datasets, or 'operational' for isAnalytics=false datasets. If not provided, uses the default dataset.",
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

type Request = SdkRequest<"get_EventListGet">;
type Query = SdkQuery<"get_EventListGet">;

const typedBuilder = withArgTypes<
	{
		search: Query["search"];
		"search-branches": Query["searchBranches"];
		order: Query["order"];
		format: Query["format"];
		cache: Query["cache"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Filter and list events",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-events list",
				classification: {
					safeFlags: ["order", "force-refresh", "format", "cache", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
						command: "cf cloudforce-one threat-events list",
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
					client.cloudforceOne.threatEvents.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
