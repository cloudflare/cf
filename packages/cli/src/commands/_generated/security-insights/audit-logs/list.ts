import operation from "../../_operations/security-insights/audit-logs/list.js";
/**
 * list command
 * @generated from apis/overlays/security-insights.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "Retrieves account or zone Audit Log",
	usage:
		"$0 security-insights audit-logs list\n\nLists audit log entries for all Security Center insights in the account or zone, showing changes to insight status and classification.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor for pagination. Use the cursor value from result_info of the previous response.",
			optional: true,
			parse: String,
		},
		"field-changed": {
			kind: "enum",
			brief: "Filter by the field that was changed.",
			values: ["status", "user_classification"],
			optional: true,
		},
		"changed-by": {
			kind: "parsed",
			brief: "Filter by the actor that made the change.",
			optional: true,
			parse: String,
		},
		since: {
			kind: "parsed",
			brief: "Filter entries changed at or after this timestamp (RFC 3339).",
			optional: true,
			parse: String,
		},
		before: {
			kind: "parsed",
			brief: "Filter entries changed before this timestamp (RFC 3339).",
			optional: true,
			parse: String,
		},
		order: {
			kind: "enum",
			brief:
				"Sort order for results. Use 'asc' for oldest first or 'desc' for newest first.",
			values: ["asc", "desc"],
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
				command: "security-insights audit-logs list",
				classification: {
					safeFlags: ["field-changed", "order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					field_changed: argv["field-changed"],
					changed_by: argv["changed-by"],
					since: argv["since"],
					before: argv["before"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf security-insights audit-logs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/security-center/insights/audit-log`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
