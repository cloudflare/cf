import operation from "../../../_operations/cloudforce-one/threat-intel/events/list.js";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "list",
	describe: "List events",
	usage:
		"$0 cloudforce-one threat-intel events list\n\nLists events, with filters passed as query parameters. `datasetId` accepts dataset UUIDs or one scope value used alone: `all` (or `*`) and `operational` select the intelligence datasets you can read, and `analytics` selects the analytics datasets you can read. A scope value covers at most 50 datasets. Without `datasetId`, the default Cloudforce One Threat Events dataset is used. To send filters in a JSON body instead, use `threat-intel events search`.",
	flags: {
		cursor: {
			kind: "parsed",
			brief:
				"Cursor for pagination. When provided, filters are embedded in the cursor so you only need to pass cursor and pageSize. Returned in the previous response's result_info.cursor field. Use cursor-based pagination for deep pagination (beyond 100,000 records) or for optimal performance.",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				'JSON-encoded. Structured search as a JSON array of {field, op, value} objects, AND\'d together. Max 10 conditions per request. `in` and `notIn` take an array of up to 100 values. `containsAny` takes an array of up to 50 strings and matches when the field contains any of them; it is not supported for `indicator`, `date`, `killChain`, or `hasChildren`. Exclusions: `not` drops events without a value for the field; `notIn` and `notContains` keep them. On intelligence datasets, a `notIn` list containing `"unknown"` also drops them; analytics datasets treat `"unknown"` as a literal value.',
			variadic: true,
			optional: true,
			parse: String,
		},
		"search-branches": {
			kind: "parsed",
			brief:
				"JSON-encoded. OR branches of structured search filters. Filters within a branch are AND'd, branches are OR'd, and the result is AND'd with `search`: `AND(search) AND OR(AND(branch 1), ...)`. Max 8 branches of 1-10 conditions each. Not supported for analytics datasets, and `indicator` filters are not yet supported inside branches. Cursor pages carry the original branches, so do not resend them with `cursor`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				"Page number (1-indexed) for offset-based pagination. Limited to offset of 100,000 records. For deep pagination, use cursor-based pagination instead.",
			optional: true,
			parse: Number,
		},
		"page-size": {
			kind: "parsed",
			brief: "Number of results per page. Maximum 25,000.",
			optional: true,
			parse: Number,
		},
		"order-by": {
			kind: "parsed",
			brief: "OrderBy",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief: "Order",
			values: ["asc", "desc"],
			optional: true,
		},
		"dataset-id": {
			kind: "parsed",
			brief:
				"Dataset UUIDs to query, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Scope values query at most 50 datasets. If not provided, uses the default dataset.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"force-refresh": { kind: "boolean", brief: "ForceRefresh", optional: true },
		format: {
			kind: "enum",
			brief: "Format",
			values: ["json", "stix2", "taxii"],
			optional: true,
		},
		cache: {
			kind: "enum",
			brief:
				"Cache strategy. 'from-graph' serves results from the graph-node KV cache when all requested UUIDs are cached; falls back to normal path on partial/zero hit.",
			values: ["from-graph"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
		),
});

export default command;
