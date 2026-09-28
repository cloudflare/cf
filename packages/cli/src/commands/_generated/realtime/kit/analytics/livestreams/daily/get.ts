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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/realtime.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit analytics livestreams daily get <app-id>\n\nReturns day-wise livestream analytics for the specified time range."
		)
		.positional("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("start-time", {
			type: "number",
			description:
				"Specify the start time as a Unix timestamp in seconds to access the livestream analytics.",
		})
		.option("end-time", {
			type: "number",
			description:
				"Specify the end time as a Unix timestamp in seconds to access the livestream analytics.",
		})
		.option("filters", {
			type: "string",
			description: "Optional filters for livestream analytics.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"get-livestream-analytics-daywise">;
type Query = SdkQuery<"get-livestream-analytics-daywise">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <app-id>",
	describe: "Fetch day-wise analytics data for your livestreams",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit analytics livestreams daily get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					start_time: argv["start-time"],
					end_time: argv["end-time"],
					filters: argv["filters"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit analytics livestreams daily get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/analytics/livestreams/daywise`,
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
					client.realtime.kit.analytics.livestreams.daily.get({
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
