import operation from "../../../_operations/cloudforce-one/priority-intelligence/matches/series.js";
/**
 * series command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "series <priority-id>",
	describe:
		"Count a priority intelligence requirement's matched events per day",
	usage:
		"$0 cloudforce-one priority-intelligence matches series <priority-id>\n\nReturns the PIR's matches per UTC day of when each matched event was added to its dataset, over the same matches as the matches list, in datasets the account can read now. Every day in the range is listed, including days with no matches. The range defaults to the last 30 days and is at most 90 days, because matches are kept for 90 days. Days before the PIR was activated hold only the most recent backfill matches. Requires the Threat Events entitlement.",
	flags: {
		since: {
			kind: "parsed",
			brief:
				"Start of the range, inclusive, on when each matched event was added to its dataset. ISO 8601; defaults to 30 days before `until`.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief:
				"End of the range, exclusive. ISO 8601; defaults to now. The range is at most 90 days.",
			optional: true,
			parse: String,
		},
		"triage-state": {
			kind: "enum",
			brief: "Only matches in this triage state.",
			values: ["new", "relevant", "not_relevant"],
			optional: true,
		},
		"include-backfill": {
			kind: "enum",
			brief:
				"Include matches from the 30 days before activation. Defaults to true.",
			values: ["true", "false"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "priority-id", brief: "Priority ID", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence matches series",
				classification: {
					safeFlags: ["triage-state", "include-backfill", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					since: argv["since"],
					until: argv["until"],
					triage_state: argv["triage-state"],
					include_backfill: argv["include-backfill"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence matches series",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/${argv["priority-id"] == null ? "<priority-id>" : encodeURIComponent(String(argv["priority-id"]))}/matches/series`,
						pathParams: { "priority-id": String(argv["priority-id"] ?? "") },
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
						priority_id: argv["priority-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
