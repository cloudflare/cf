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
 * @generated from apis/overlays/realtime.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit recordings list\n\nReturns all recordings for an App. If the `meeting_id` parameter is passed, returns all recordings for the given meeting ID."
		)
		.option("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("meeting-id", {
			type: "string",
			description:
				"ID of a meeting. Optional. Will limit results to only this meeting if passed.",
		})
		.option("page-no", {
			type: "number",
			description:
				"The page number from which you want your page search results to be displayed.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results per page",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("expired", {
			type: "boolean",
			description:
				"If passed, only shows expired/non-expired recordings on RealtimeKit's bucket",
		})
		.option("search", {
			type: "string",
			description:
				"The search query string. You can search using the meeting ID or title.",
		})
		.option("sort-by", {
			type: "string",
			description: "Sort by",
			choices: ["invokedTime"],
		})
		.option("sort-order", {
			type: "string",
			description: "Sort order",
			choices: ["ASC", "DESC"],
		})
		.option("start-time", {
			type: "string",
			description:
				"The start time range for which you want to retrieve the meetings. The time must be specified in ISO format.",
		})
		.option("end-time", {
			type: "string",
			description:
				"The end time range for which you want to retrieve the meetings. The time must be specified in ISO format.",
		})
		.option("status", {
			type: "string",
			description: "Filter by one or more recording status",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_all_recordings">;
type Query = SdkQuery<"get_all_recordings">;

const typedBuilder = withArgTypes<
	{
		"sort-by": Query["sort_by"];
		"sort-order": Query["sort_order"];
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Fetch all recordings for an App",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit recordings list",
				classification: {
					safeFlags: ["expired", "sort-by", "sort-order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					meeting_id: argv["meeting-id"],
					page_no: argv["page-no"],
					per_page: argv["per-page"],
					expired: argv["expired"],
					search: argv["search"],
					sort_by: argv["sort-by"],
					sort_order: argv["sort-order"],
					start_time: argv["start-time"],
					end_time: argv["end-time"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit recordings list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/recordings`,
						pathParams: { "app-id": String(argv["app-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.realtime.kit.recordings.list({
						account_id: accountId,
						app_id: argv["app-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
