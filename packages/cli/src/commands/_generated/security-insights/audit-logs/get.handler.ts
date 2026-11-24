import operation from "../../_operations/security-insights/audit-logs/get.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "security-insights audit-logs get",
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
					argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
				formatDryRun({
					command: "cf security-insights audit-logs get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/security-center/insights/${argv["issue-id"] == null ? "<issue-id>" : encodeURIComponent(String(argv["issue-id"]))}/audit-log`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
						"account-or-zone-id": String(accountOrZoneId),
						"issue-id": String(argv["issue-id"] ?? ""),
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
					? await getZoneId({ zone: argv.zone }, client, { quiet: argv.quiet })
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
					issue_id: argv["issue-id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
