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
			"$0 cloudforce-one events tags relationships list\n\nReturns sparse relationship edges. Optionally hydrate related entities via `expand`. Fans out across accessible intelligence (isAnalytics=false) indicator dataset shards; `all` and `operational` are equivalent. Analytics datasets do not expose tag associations, so the analytics scope returns an empty result."
		)
		.option("tag-uuid", {
			type: "string",
			description: "Tag UUID.",
			demandOption: true,
		})
		.option("datasets", {
			type: "string",
			description:
				"Comma-separated dataset UUIDs to scope to, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Analytics datasets do not expose tag associations, so 'analytics' returns an empty result. Omit for 'all'.",
		})
		.option("search", {
			type: "string",
			description:
				"JSON array of {field, op, value} filters (same as indicator list search).",
		})
		.option("expand", {
			type: "string",
			description:
				"Comma-separated entity types to hydrate (event, indicator, tag).",
		})
		.option("cursor", {
			type: "string",
			description: "Offset cursor from a previous page.",
		})
		.option("page-size", {
			type: "number",
			description: "Page size (1–100, default 25).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_TagRelationshipsList">;
type Query = SdkQuery<"get_TagRelationshipsList">;

const typedBuilder = withArgTypes<
	{
		search: Query["search"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List relationships for a tag",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events tags relationships list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					datasets: argv["datasets"],
					search: argv["search"],
					expand: argv["expand"],
					cursor: argv["cursor"],
					pageSize: argv["page-size"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events tags relationships list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}/relationships`,
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
					client.cloudforceOne.events.tags.relationships.list({
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
