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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/images.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 images list\n\nList up to 10000 images from CF Images, with up to 1000 results per page. Use the optional parameters below to get a specific range of images. Pagination is supported via continuation_token. **Metadata Filtering (Optional):** You can optionally filter images by custom metadata fields using the `meta.<field>[<operator>]=<value>` syntax. **Supported Operators:** - `eq` / `eq:string` / `eq:number` / `eq:boolean` - Exact match - `gt` / `gt:number` - Greater than (number only) - `gte` / `gte:number` - Greater than or equal (number only) - `lt` / `lt:number` - Less than (number only) - `lte` / `lte:number` - Less than or equal (number only) - `in` / `in:string` / `in:number` - Match any value in list (pipe-separated) **Metadata Filter Constraints:** - Maximum 5 metadata filters per request - Maximum 5 levels of nesting (e.g., `meta.first.second.third.fourth.fifth`) - Maximum 10 elements for list operators (`in`) - Supports string, number, and boolean value types - Range operators (`gt`, `gte`, `lt`, `lte`) only accept numeric values **Filter Consistency:** Filters are combined with AND logic. The system does not validate whether filter combinations are logically consistent. For example, `meta.priority[eq:number]=5&meta.priority[lte:number]=3` will return zero results because no value can satisfy both conditions simultaneously. It is the caller's responsibility to ensure filter combinations make sense. **Examples:** ``` # List all images /images/v2 # Filter by metadata [eq] /images/v2?meta.status[eq:string]=active # Filter by metadata [in] /images/v2?meta.status[in]=pending|deleted|flagged # Filter by metadata [in:number] /images/v2?meta.ratings[in:number]=4|5 # Filter by metadata range [gte:number] /images/v2?meta.priority[gte:number]=1 # Filter by bounded range /images/v2?meta.priority[gte:number]=1&meta.priority[lte:number]=5 # Filter by nested metadata /images/v2?meta.region.name[eq]=eu-west # Combine metadata filters with creator /images/v2?meta.status[eq]=active&creator=user123 # Multiple metadata filters (AND logic) /images/v2?meta.status[eq]=active&meta.priority[eq:number]=5 ```"
		)
		.option("continuation-token", {
			type: "string",
			description:
				"Continuation token to fetch next page. Passed as a query param when requesting List V2 api endpoint.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page",
		})
		.option("sort-order", {
			type: "string",
			description: "Sorting order by upload time",
			choices: ["asc", "desc"],
		})
		.option("creator", {
			type: "string",
			description:
				'Internal user ID set within the creator field. Setting to empty string "" will return images where creator field is not set',
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"cloudflare-images-list-images-v2">;
type Query = SdkQuery<"cloudflare-images-list-images-v2">;

const typedBuilder = withArgTypes<
	{
		"sort-order": Query["sort_order"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List images V2",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images list",
				classification: {
					safeFlags: ["sort-order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.images.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
