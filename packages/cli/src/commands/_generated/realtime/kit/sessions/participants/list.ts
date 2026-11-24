import operation from "../../../../_operations/realtime/kit/sessions/participants/list.js";
/**
 * list command
 * @generated from apis/overlays/realtime.ts
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
	describe: "Fetch participants list of a session",
	usage:
		"$0 realtime kit sessions participants list\n\nReturns a list of participants for the given session ID.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"session-id": { kind: "parsed", brief: "ID of the session", parse: String },
		search: {
			kind: "parsed",
			brief:
				"The search query string. You can search using participant ID, custom participant ID, or display name.",
			optional: true,
			parse: String,
		},
		"page-no": {
			kind: "parsed",
			brief:
				"The page number from which you want your page search results to be displayed.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort order",
			values: ["ASC", "DESC"],
			optional: true,
		},
		"sort-by": {
			kind: "enum",
			brief: "Sort by",
			values: ["joinedAt", "duration"],
			optional: true,
		},
		"include-peer-events": {
			kind: "boolean",
			brief: "if true, response includes all the peer events of participants.",
			optional: true,
		},
		view: {
			kind: "enum",
			brief:
				"In breakout room sessions, the view parameter can be set to `raw` for session specific duration for participants or `consolidated` to accumulate breakout room durations.",
			values: ["raw", "consolidated"],
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
				command: "realtime kit sessions participants list",
				classification: {
					safeFlags: [
						"sort-order",
						"sort-by",
						"include-peer-events",
						"view",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, {
						account_id: accountId,
						app_id: argv["app-id"],
						session_id: argv["session-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
