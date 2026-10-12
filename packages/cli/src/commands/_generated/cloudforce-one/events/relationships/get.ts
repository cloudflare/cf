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
			"$0 cloudforce-one events relationships get <event-id>\n\nThe `event_id` must be defined (to list existing events (and their IDs), use the [`Filter and List Events`](https://developers.cloudflare.com/api/resources/cloudforce_one/subresources/threat_events/methods/list/) endpoint). Also, must provide query parameters."
		)
		.positional("event-id", {
			type: "string",
			description: "Event UUID.",
			demandOption: true,
		})
		.option("direction", {
			type: "string",
			description:
				"The direction to traverse the graph. Defaults to 'both' to search all.",
			choices: ["ancestors", "descendants", "both"],
		})
		.option("max-depth", {
			type: "number",
			description: "The maximum depth to traverse. Defaults to 5.",
		})
		.option("relationship-types", {
			type: "string",
			description: "An optional array of relationship types to filter by.",
		})
		.option("indicator-type-ids", {
			type: "string",
			description:
				"An optional array of indicator type IDs to filter the results by.",
		})
		.option("dataset-id", {
			type: "string",
			description: "The dataset ID to search within.",
			demandOption: true,
		})
		.option("include-parent", {
			type: "boolean",
			description:
				"Whether to include the starting event in the results. Defaults to true.",
		})
		.option("page", { type: "number", description: "Page" })
		.option("page-size", { type: "number", description: "PageSize" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_EventRelationships">;
type Query = SdkQuery<"get_EventRelationships">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		"relationship-types": Query["relationshipTypes"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <event-id>",
	describe: "Filter and list events related to specific event",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events relationships get",
				classification: {
					safeFlags: ["direction", "include-parent", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					direction: argv["direction"],
					maxDepth: argv["max-depth"],
					relationshipTypes: argv["relationship-types"],
					indicatorTypeIds: argv["indicator-type-ids"],
					datasetId: argv["dataset-id"],
					includeParent: argv["include-parent"],
					page: argv["page"],
					pageSize: argv["page-size"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events relationships get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/by-id/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}/relationships`,
						pathParams: { "event-id": String(argv["event-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.cloudforceOne.events.relationships.get({
						account_id: accountId,
						event_id: argv["event-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
