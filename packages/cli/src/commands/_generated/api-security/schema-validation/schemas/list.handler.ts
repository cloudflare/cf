import operation from "../../../_operations/api-security/schema-validation/schemas/list.js";
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
			command: "api-security schema-validation schemas list",
			classification: {
				safeFlags: ["omit-source", "validation-enabled", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				page: argv["page"],
				per_page: argv["per-page"],
				omit_source: argv["omit-source"],
				validation_enabled: argv["validation-enabled"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf api-security schema-validation schemas list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/schema_validation/schemas`,
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
