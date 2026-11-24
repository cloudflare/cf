import operation from "../../../_operations/api-security/token-validation/rules/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "api-security token-validation rules list",
			classification: {
				safeFlags: ["action", "enabled", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				per_page: argv["per-page"],
				page: argv["page"],
				token_configuration: argv["token-configuration"],
				action: argv["action"],
				enabled: argv["enabled"],
				id: argv["id"],
				rule_id: argv["rule-id"],
				host: argv["host"],
				hostname: argv["hostname"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf api-security token-validation rules list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/rules`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { zone_id: zoneId, ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
