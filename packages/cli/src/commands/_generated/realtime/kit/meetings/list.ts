import operation from "../../../_operations/realtime/kit/meetings/list.js";
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
	describe: "Fetch all meetings for an App",
	usage:
		"$0 realtime kit meetings list\n\nReturns all meetings for the given App ID.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
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
			brief: "Number of results per page",
			optional: true,
			parse: Number,
		},
		"start-time": {
			kind: "parsed",
			brief:
				"The start time range for which you want to retrieve the meetings. The time must be specified in ISO format.",
			optional: true,
			parse: String,
		},
		"end-time": {
			kind: "parsed",
			brief:
				"The end time range for which you want to retrieve the meetings. The time must be specified in ISO format.",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"The search query string. You can search using the meeting ID or title.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter meetings by status.",
			values: ["ACTIVE", "INACTIVE"],
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
				command: "realtime kit meetings list",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page_no: argv["page-no"],
					per_page: argv["per-page"],
					start_time: argv["start-time"],
					end_time: argv["end-time"],
					search: argv["search"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit meetings list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/meetings`,
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
					client.send(operation, {
						account_id: accountId,
						app_id: argv["app-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
