import operation from "../../../_operations/cloudforce-one/priority-intelligence/matches/aggregate-all.js";
/**
 * aggregate-all command
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
	command: "aggregate-all",
	describe:
		"Count matched events across the account's priority intelligence requirements",
	usage:
		"$0 cloudforce-one priority-intelligence matches aggregate-all\n\nReturns each active PIR's match counts, with the same fields and filters as a single PIR's aggregate, and the number of distinct values of each field across all of them, each value counted once. Counts are not summed across PIRs: an event can match several PIRs. Drafts are left out; PIRs the matcher paused are included. A PIR whose matches cannot be counted is returned with `error` and left out of `combined`. Requires the Threat Events entitlement.",
	flags: {
		"aggregate-by": {
			kind: "parsed",
			brief:
				"Comma-separated fields to count: tags, attacker, attacker_country, target_industry, indicator, indicator_type. `indicator` is each event's primary indicator, the first one it was created with.",
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Top values returned per field.",
			optional: true,
			parse: Number,
		},
		since: {
			kind: "parsed",
			brief: "Only matches first matched at or after this ISO 8601 time.",
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence matches aggregate-all",
				classification: {
					safeFlags: ["triage-state", "include-backfill", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					aggregate_by: argv["aggregate-by"],
					limit: argv["limit"],
					since: argv["since"],
					triage_state: argv["triage-state"],
					include_backfill: argv["include-backfill"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one priority-intelligence matches aggregate-all",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/matches/aggregate`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
