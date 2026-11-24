import operation from "../../_operations/abuse-reports/mitigations/list.js";
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
	describe: "List abuse report mitigations",
	usage:
		"$0 abuse-reports mitigations list\n\nList mitigations done to remediate the abuse report.",
	flags: {
		"report-id": { kind: "parsed", brief: "Abuse Report ID", parse: String },
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
			kind: "enum",
			brief: "A property to sort by, followed by the order",
			values: [
				"type,asc",
				"type,desc",
				"effective_date,asc",
				"effective_date,desc",
				"status,asc",
				"status,desc",
				"entity_type,asc",
				"entity_type,desc",
			],
			optional: true,
		},
		type: {
			kind: "parsed",
			brief:
				"Filter by the type of mitigation. This filter parameter can be specified multiple times to include multiple types of mitigations in the result set.",
			optional: true,
			parse: String,
		},
		"effective-before": {
			kind: "parsed",
			brief: "Returns mitigations that were dispatched before the given date",
			optional: true,
			parse: String,
		},
		"effective-after": {
			kind: "parsed",
			brief: "Returns mitigation that were dispatched after the given date",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter by the status of the mitigation.",
			values: ["pending", "active", "in_review", "cancelled", "removed"],
			optional: true,
		},
		"entity-type": {
			kind: "enum",
			brief: "Filter by the type of entity the mitigation impacts.",
			values: ["url_pattern", "account", "zone", "domain", "custom_expression"],
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
				command: "abuse-reports mitigations list",
				classification: {
					safeFlags: ["sort", "status", "entity-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					sort: argv["sort"],
					type: argv["type"],
					effective_before: argv["effective-before"],
					effective_after: argv["effective-after"],
					status: argv["status"],
					entity_type: argv["entity-type"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports mitigations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/${argv["report-id"] == null ? "<report-id>" : encodeURIComponent(String(argv["report-id"]))}/mitigations`,
						pathParams: { "report-id": String(argv["report-id"] ?? "") },
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
						report_id: argv["report-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
