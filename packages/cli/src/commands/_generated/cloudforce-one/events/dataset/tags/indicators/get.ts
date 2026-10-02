import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
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
			"$0 cloudforce-one events dataset tags indicators get <tag-uuid>\n\nReturns indicators associated with the provided tag UUID, with pagination. By default fans out across every indicator dataset the account can read; pass datasetIds to scope to UUIDs, analytics datasets, or operational datasets. Analytics datasets do not expose tag associations, so the analytics scope returns an empty result."
		)
		.positional("tag-uuid", {
			type: "string",
			description: "Tag UUID.",
			demandOption: true,
		})
		.option("dataset-ids", {
			type: "string",
			description:
				"Dataset UUIDs to scope to (repeat the param for multiple), or one standalone scope: 'all'/'*', 'analytics' for isAnalytics=true datasets, or 'operational' for isAnalytics=false datasets. Analytics datasets do not expose tag associations, so 'analytics' returns an empty result. Omit to search all readable datasets.",
		})
		.option("page", { type: "number", description: "Page" })
		.option("page-size", { type: "number", description: "PageSize" })
		.option("indicator-type", { type: "string", description: "IndicatorType" })
		.option("related-event", {
			type: "string",
			description:
				"Filter indicators by related event UUID(s). Multiple UUIDs can be provided by repeating the parameter.",
		})
		.option("search", {
			type: "string",
			description:
				"Structured search as a JSON array of {field, op, value} objects. Searchable fields: value, indicatorType. Multiple conditions are AND'd together. Max 10 conditions per request.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_TagIndicatorsList">;
type Query = SdkQuery<"get_TagIndicatorsList">;

const typedBuilder = withArgTypes<
	{
		search: Query["search"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <tag-uuid>",
	describe: "List indicators related to a tag",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events dataset tags indicators get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					datasetIds: argv["dataset-ids"],
					page: argv["page"],
					pageSize: argv["page-size"],
					indicatorType: argv["indicator-type"],
					relatedEvent: argv["related-event"],
					search: argv["search"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events dataset tags indicators get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}/indicators`,
						pathParams: { "tag-uuid": String(argv["tag-uuid"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.cloudforceOne.events.dataset.tags.indicators.get({
						account_id: accountId,
						tag_uuid: argv["tag-uuid"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
