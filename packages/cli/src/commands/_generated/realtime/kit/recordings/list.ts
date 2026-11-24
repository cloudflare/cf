import operation from "../../../_operations/realtime/kit/recordings/list.js";
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
	describe: "Fetch all recordings for an App",
	usage:
		"$0 realtime kit recordings list\n\nReturns all recordings for an App. If the `meeting_id` parameter is passed, returns all recordings for the given meeting ID.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"meeting-id": {
			kind: "parsed",
			brief:
				"ID of a meeting. Optional. Will limit results to only this meeting if passed.",
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
			brief: "Number of results per page",
			optional: true,
			parse: Number,
		},
		expired: {
			kind: "boolean",
			brief:
				"If passed, only shows expired/non-expired recordings on RealtimeKit's bucket",
			optional: true,
		},
		search: {
			kind: "parsed",
			brief:
				"The search query string. You can search using the meeting ID or title.",
			optional: true,
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief: "Sort by",
			values: ["invokedTime"],
			optional: true,
		},
		"sort-order": {
			kind: "enum",
			brief: "Sort order",
			values: ["ASC", "DESC"],
			optional: true,
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
		status: {
			kind: "parsed",
			brief: "Filter by one or more recording status",
			variadic: true,
			optional: true,
			choices: [
				"INVOKED",
				"RECORDING",
				"UPLOADING",
				"UPLOADED",
				"ERRORED",
				"PAUSED",
			],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
				command: "realtime kit recordings list",
				classification: {
					safeFlags: ["expired", "sort-by", "sort-order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
