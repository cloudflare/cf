import operation from "../../../_operations/cloudforce-one/priority-intelligence/matches/list.js";
/**
 * list command
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
	command: "list",
	describe: "List a priority intelligence requirement's matched events",
	usage:
		"$0 cloudforce-one priority-intelligence matches list\n\nReturns the events matched by the PIR's query, newest match first. Each item has the Event List event fields plus the match fields. Only datasets the account can read now are included, and deleted events are left out, so a page can hold fewer items than `per_page` while `result_info.cursor` is still set. `backfill` matches came from the 30 days before the PIR was activated or its query changed and are never notified. `delivered` matches were included in a digest that the notification service accepted; who receives it depends on the account's notification policies for the PIR. Requires the Threat Events entitlement.",
	flags: {
		"priority-id": { kind: "parsed", brief: "Priority ID", parse: String },
		cursor: {
			kind: "parsed",
			brief:
				"`result_info.cursor` from the previous page. Omit for the newest matches.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Matches per page.",
			optional: true,
			parse: Number,
		},
		"triage-state": {
			kind: "enum",
			brief: "Only matches in this triage state.",
			values: ["new", "relevant", "not_relevant"],
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
				command: "cloudforce-one priority-intelligence matches list",
				classification: {
					safeFlags: ["triage-state", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					triage_state: argv["triage-state"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one priority-intelligence matches list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/${argv["priority-id"] == null ? "<priority-id>" : encodeURIComponent(String(argv["priority-id"]))}/matches`,
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
