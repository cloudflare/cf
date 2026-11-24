import operation from "../_operations/images/list.js";
/**
 * list command
 * @generated from apis/overlays/images.ts
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
	describe: "List images V2",
	usage:
		"$0 images list\n\nList up to 10000 images from CF Images, with up to 1000 results per page. Use the optional parameters below to get a specific range of images. Pagination is supported via continuation_token. **Metadata Filtering (Optional):** You can optionally filter images by custom metadata fields using the `meta.<field>[<operator>]=<value>` syntax. **Supported Operators:** - `eq` / `eq:string` / `eq:number` / `eq:boolean` - Exact match - `gt` / `gt:number` - Greater than (number only) - `gte` / `gte:number` - Greater than or equal (number only) - `lt` / `lt:number` - Less than (number only) - `lte` / `lte:number` - Less than or equal (number only) - `in` / `in:string` / `in:number` - Match any value in list (pipe-separated) **Metadata Filter Constraints:** - Maximum 5 metadata filters per request - Maximum 5 levels of nesting (e.g., `meta.first.second.third.fourth.fifth`) - Maximum 10 elements for list operators (`in`) - Supports string, number, and boolean value types - Range operators (`gt`, `gte`, `lt`, `lte`) only accept numeric values **Filter Consistency:** Filters are combined with AND logic. The system does not validate whether filter combinations are logically consistent. For example, `meta.priority[eq:number]=5&meta.priority[lte:number]=3` will return zero results because no value can satisfy both conditions simultaneously. It is the caller's responsibility to ensure filter combinations make sense. **Examples:** ``` # List all images /images/v2 # Filter by metadata [eq] /images/v2?meta.status[eq:string]=active # Filter by metadata [in] /images/v2?meta.status[in]=pending|deleted|flagged # Filter by metadata [in:number] /images/v2?meta.ratings[in:number]=4|5 # Filter by metadata range [gte:number] /images/v2?meta.priority[gte:number]=1 # Filter by bounded range /images/v2?meta.priority[gte:number]=1&meta.priority[lte:number]=5 # Filter by nested metadata /images/v2?meta.region.name[eq]=eu-west # Combine metadata filters with creator /images/v2?meta.status[eq]=active&creator=user123 # Multiple metadata filters (AND logic) /images/v2?meta.status[eq]=active&meta.priority[eq:number]=5 ```",
	flags: {
		"continuation-token": {
			kind: "parsed",
			brief:
				"Continuation token to fetch next page. Passed as a query param when requesting List V2 api endpoint.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page",
			optional: true,
			parse: Number,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sorting order by upload time",
			values: ["asc", "desc"],
			optional: true,
		},
		creator: {
			kind: "parsed",
			brief:
				'Internal user ID set within the creator field. Setting to empty string "" will return images where creator field is not set',
			optional: true,
			parse: String,
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
				command: "images list",
				classification: {
					safeFlags: ["sort-order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					continuation_token: argv["continuation-token"],
					per_page: argv["per-page"],
					sort_order: argv["sort-order"],
					creator: argv["creator"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v2`,
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
