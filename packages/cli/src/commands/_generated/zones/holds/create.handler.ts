import operation from "../../_operations/zones/holds/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zones holds create",
			classification: {
				safeFlags: ["include-subdomains", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				include_subdomains: argv["include-subdomains"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf zones holds create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/hold`,
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

			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { zone_id: zoneId, ...queryParams })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
