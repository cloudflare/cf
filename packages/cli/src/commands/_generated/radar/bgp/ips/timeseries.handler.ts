import operation from "../../../_operations/radar/bgp/ips/timeseries.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./timeseries.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar bgp ips timeseries",
			classification: {
				safeFlags: ["include-delay", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				name: argv["name"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				asn: argv["asn"],
				location: argv["location"],
				ipVersion: argv["ip-version"],
				includeDelay: argv["include-delay"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bgp ips timeseries",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bgp/ips/timeseries`,
					pathParams: {},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, queryParams)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
