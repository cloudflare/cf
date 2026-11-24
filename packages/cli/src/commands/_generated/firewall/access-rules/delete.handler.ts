import operation from "../../_operations/firewall/access-rules/delete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "firewall access-rules delete",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId =
					argv.zone === undefined ? await resolveAccountIdSilent() : undefined;
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
				formatDryRun({
					command: "cf firewall access-rules delete",
					method: "DELETE",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/firewall/access_rules/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
						"account-or-zone-id": String(accountOrZoneId),
						"rule-id": String(argv["rule-id"] ?? ""),
					},
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

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `This operation deletes the account-level IP Access Rule and affects every zone in the account.`,
				}))
			) {
				return;
			}

			const result = await withProgress(`Deleting`, async () =>
				client.send(operation, {
					account_or_zone: accountOrZone,
					account_or_zone_id: accountOrZoneId,
					rule_id: argv["rule-id"],
				})
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
