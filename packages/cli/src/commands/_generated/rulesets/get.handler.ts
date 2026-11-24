import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
	requestApi,
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
			command: "rulesets get",
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
					command: "cf rulesets get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/rulesets/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
					pathParams: {
						"account-or-zone": String(accountOrZone),
						"account-or-zone-id": String(accountOrZoneId),
						id: String(argv["id"] ?? ""),
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
				requestApi<unknown>(
					client,
					"GET",
					`/${accountOrZone}/${accountOrZoneId}/rulesets/${encodeURIComponent(String(argv["id"]))}`
				)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
