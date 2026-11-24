import operation from "../../_operations/speed/pages/trend.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./trend.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "speed pages trend",
			classification: {
				safeFlags: ["region", "device-type", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				region: argv["region"],
				deviceType: argv["device-type"],
				start: argv["start"],
				end: argv["end"],
				tz: argv["tz"],
				metrics: argv["metrics"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf speed pages trend",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/speed_api/pages/${argv["url"] == null ? "<url>" : encodeURIComponent(String(argv["url"]))}/trend`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						url: String(argv["url"] ?? ""),
					},
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
				client.send(operation, {
					zone_id: zoneId,
					url: argv["url"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
