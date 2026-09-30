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
			"$0 realtime kit sessions participants list\n\nReturns a list of participants for the given session ID."
		)
		.option("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("session-id", {
			type: "string",
			description: "ID of the session",
			demandOption: true,
		})
		.option("search", {
			type: "string",
			description:
				"The search query string. You can search using participant ID, custom participant ID, or display name.",
		})
		.option("page-no", {
			type: "number",
			description:
				"The page number from which you want your page search results to be displayed.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("sort-order", {
			type: "string",
			description: "Sort order",
			choices: ["ASC", "DESC"],
		})
		.option("sort-by", {
			type: "string",
			description: "Sort by",
			choices: ["joinedAt", "duration"],
		})
		.option("include-peer-events", {
			type: "boolean",
			description:
				"if true, response includes all the peer events of participants.",
		})
		.option("view", {
			type: "string",
			description:
				"In breakout room sessions, the view parameter can be set to `raw` for session specific duration for participants or `consolidated` to accumulate breakout room durations.",
			choices: ["raw", "consolidated"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"GetSessionParticipants">;
type Query = SdkQuery<"GetSessionParticipants">;

const typedBuilder = withArgTypes<
	{
		"sort-order": Query["sort_order"];
		"sort-by": Query["sort_by"];
		view: Query["view"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Fetch participants list of a session",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit sessions participants list",
				classification: {
					safeFlags: [
						"sort-order",
						"sort-by",
						"include-peer-events",
						"view",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					search: argv["search"],
					page_no: argv["page-no"],
					per_page: argv["per-page"],
					sort_order: argv["sort-order"],
					sort_by: argv["sort-by"],
					include_peer_events: argv["include-peer-events"],
					view: argv["view"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit sessions participants list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/sessions/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}/participants`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"session-id": String(argv["session-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.realtime.kit.sessions.participants.list({
						account_id: accountId,
						app_id: argv["app-id"],
						session_id: argv["session-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
