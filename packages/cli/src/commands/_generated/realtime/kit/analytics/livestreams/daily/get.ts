import operation from "../../../../../_operations/realtime/kit/analytics/livestreams/daily/get.js";
/**
 * get command
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
	command: "get <app-id>",
	describe: "Fetch day-wise analytics data for your livestreams",
	usage:
		"$0 realtime kit analytics livestreams daily get <app-id>\n\nReturns day-wise livestream analytics for the specified time range.",
	flags: {
		"start-time": {
			kind: "parsed",
			brief:
				"Specify the start time as a Unix timestamp in seconds to access the livestream analytics.",
			optional: true,
			parse: Number,
		},
		"end-time": {
			kind: "parsed",
			brief:
				"Specify the end time as a Unix timestamp in seconds to access the livestream analytics.",
			optional: true,
			parse: Number,
		},
		filters: {
			kind: "parsed",
			brief: "Optional filters for livestream analytics.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "app-id", brief: "The app identifier tag.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit analytics livestreams daily get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
