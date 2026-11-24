import operation from "../_operations/abuse-reports/list.js";
/**
 * list command
 * @generated from apis/overlays/abuse-reports.ts
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
	describe: "List abuse reports against the account",
	usage:
		"$0 abuse-reports list\n\nList abuse reports made against domains or other content associated with the account. To list reports that the account submitted, use the submitted abuse reports endpoint instead.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Where in pagination to start listing abuse reports",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "How many abuse reports per page to list",
			optional: true,
			parse: Number,
		},
		sort: {
			kind: "parsed",
			brief:
				"A property to sort by, followed by the order (id, cdate, domain, type, status)",
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Free-text search. Returns reports whose report ID starts with the term or whose domain contains the term, both case-insensitively. Surrounding whitespace is ignored, and an empty value is treated as absent. Combined with the other filters using AND.",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief: "Filter by domain name related to the abuse report",
			optional: true,
			parse: String,
		},
		"created-before": {
			kind: "parsed",
			brief: "Returns reports created before the specified date",
			optional: true,
			parse: String,
		},
		"created-after": {
			kind: "parsed",
			brief: "Returns reports created after the specified date",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter by the status of the report.",
			values: ["accepted", "in_review"],
			optional: true,
		},
		type: {
			kind: "enum",
			brief: "Filter by the type of the report.",
			values: [
				"PHISH",
				"GEN",
				"THREAT",
				"DMCA",
				"EMER",
				"TM",
				"REG_WHO",
				"NCSEI",
				"NETWORK",
			],
			optional: true,
		},
		"mitigation-status": {
			kind: "enum",
			brief: "Filter reports that have any mitigations in the given status.",
			values: ["pending", "active", "in_review", "cancelled", "removed"],
			optional: true,
		},
		"pending-notice": {
			kind: "boolean",
			brief:
				"Also include reports in an open Notice and Takedown notice period. Combined with mitigation_status using OR, e.g. ?mitigation_status=active&pending_notice=true.",
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
				command: "abuse-reports list",
				classification: {
					safeFlags: [
						"status",
						"type",
						"mitigation-status",
						"pending-notice",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					sort: argv["sort"],
					search: argv["search"],
					domain: argv["domain"],
					created_before: argv["created-before"],
					created_after: argv["created-after"],
					status: argv["status"],
					type: argv["type"],
					mitigation_status: argv["mitigation-status"],
					pending_notice: argv["pending-notice"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports`,
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
