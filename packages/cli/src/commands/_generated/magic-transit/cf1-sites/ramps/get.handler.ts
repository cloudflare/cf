import operation from "../../../_operations/magic-transit/cf1-sites/ramps/get.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "magic-transit cf1-sites ramps get",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf magic-transit cf1-sites ramps get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cf1_sites/${argv["cf1-site-id"] == null ? "<cf1-site-id>" : encodeURIComponent(String(argv["cf1-site-id"]))}/ramps/${argv["ramp-id"] == null ? "<ramp-id>" : encodeURIComponent(String(argv["ramp-id"]))}`,
					pathParams: {
						"cf1-site-id": String(argv["cf1-site-id"] ?? ""),
						"ramp-id": String(argv["ramp-id"] ?? ""),
					},
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
					cf1_site_id: argv["cf1-site-id"],
					ramp_id: argv["ramp-id"],
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
