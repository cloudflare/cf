import operation from "../../_operations/custom-pages/account-assets/get.js";
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
			command: "custom-pages account-assets get",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
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
					command: "cf custom-pages account-assets get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/custom_pages/assets/${argv["asset-name"] == null ? "<asset-name>" : encodeURIComponent(String(argv["asset-name"]))}`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
						"account-or-zone-id": String(accountOrZoneId),
						"asset-name": String(argv["asset-name"] ?? ""),
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

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					account_or_zone: accountOrZone,
					account_or_zone_id: accountOrZoneId,
					asset_name: argv["asset-name"],
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
