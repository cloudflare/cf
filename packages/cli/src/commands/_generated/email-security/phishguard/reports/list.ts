import operation from "../../../_operations/email-security/phishguard/reports/list.js";
/**
 * list command
 * @generated from apis/overlays/email-security.ts
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
	describe: "List PhishGuard reports",
	usage:
		"$0 email-security phishguard reports list\n\nRetrieves PhishGuard security alert reports for a specified date range. Reports include detected threats, dispositions, and contextual information. Use for security monitoring and threat analysis.",
	flags: {
		start: {
			kind: "parsed",
			brief:
				"Start of the time range (RFC3339). Takes precedence over from_date.",
			optional: true,
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "End of the time range (RFC3339). Takes precedence over to_date.",
			optional: true,
			parse: String,
		},
		"from-date": {
			kind: "parsed",
			brief:
				"Deprecated, use `start` instead. Start date in YYYY-MM-DD format.",
			optional: true,
			parse: String,
		},
		"to-date": {
			kind: "parsed",
			brief: "Deprecated, use `end` instead. End date in YYYY-MM-DD format.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Current page within paginated list of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page. Maximum value is 1000.",
			optional: true,
			parse: Number,
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
				command: "email-security phishguard reports list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					start: argv["start"],
					end: argv["end"],
					from_date: argv["from-date"],
					to_date: argv["to-date"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security phishguard reports list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/phishguard/reports`,
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
