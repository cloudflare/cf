import operation from "../../../_operations/realtime/kit/livestreams/list.js";
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
	describe: "Fetch all livestreams",
	usage:
		"$0 realtime kit livestreams list\n\nReturns details of livestreams associated with the given App ID. It includes livestreams created by your App and RealtimeKit meetings that are livestreamed by your App. If you only want details of livestreams created by your App and not RealtimeKit meetings, you can use the `exclude_meetings` query parameter.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"exclude-meetings": {
			kind: "boolean",
			brief: "Exclude the RealtimeKit meetings that are livestreamed.",
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		"page-no": {
			kind: "parsed",
			brief:
				"The page number from which you want your page search results to be displayed.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief: "Specifies the status of the operation.",
			values: ["LIVE", "IDLE", "ERRORED", "INVOKED"],
			optional: true,
		},
		"start-time": {
			kind: "parsed",
			brief:
				"Specify the start time range in ISO format to access the live stream.",
			optional: true,
			parse: String,
		},
		"end-time": {
			kind: "parsed",
			brief:
				"Specify the end time range in ISO format to access the live stream.",
			optional: true,
			parse: String,
		},
		"sort-order": {
			kind: "enum",
			brief: "Specifies the sorting order for the results.",
			values: ["ASC", "DSC"],
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
				command: "realtime kit livestreams list",
				classification: {
					safeFlags: ["exclude-meetings", "status", "sort-order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					exclude_meetings: argv["exclude-meetings"],
					per_page: argv["per-page"],
					page_no: argv["page-no"],
					status: argv["status"],
					start_time: argv["start-time"],
					end_time: argv["end-time"],
					sort_order: argv["sort-order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit livestreams list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/livestreams`,
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
