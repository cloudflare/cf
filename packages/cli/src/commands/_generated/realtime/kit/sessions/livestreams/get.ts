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
			"$0 realtime kit sessions livestreams get <session-id>\n\nReturns livestream session details for the given session ID. Retreive the session ID using the `Fetch all sessions of an App` API."
		)
		.positional("session-id", {
			type: "string",
			description: "Session ID",
			demandOption: true,
		})
		.option("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("page-no", {
			type: "number",
			description:
				"The page number from which you want your page search results to be displayed.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"get-v2-livestreamsession-session-meetingId-active-livestream">;
type Query =
	SdkQuery<"get-v2-livestreamsession-session-meetingId-active-livestream">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <session-id>",
	describe: "Fetch livestream session details using a session ID",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit sessions livestreams get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					per_page: argv["per-page"],
					page_no: argv["page-no"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit sessions livestreams get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/sessions/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}/livestream-sessions`,
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
					client.realtime.kit.sessions.livestreams.get({
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
