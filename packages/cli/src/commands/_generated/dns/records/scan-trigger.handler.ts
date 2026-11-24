import operation from "../../_operations/dns/records/scan-trigger.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./scan-trigger.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "dns records scan-trigger",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf dns records scan-trigger",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/scan/trigger`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
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
				client.send(operation, { zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
