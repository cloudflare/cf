import operation from "../../../_operations/radar/attacks/layer3/timeseries.js";
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
			command: "radar attacks layer3 timeseries",
			classification: {
				safeFlags: [
					"agg-interval",
					"normalization",
					"metric",
					"direction",
					"format",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				aggInterval: argv["agg-interval"],
				name: argv["name"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				asn: argv["asn"],
				location: argv["location"],
				continent: argv["continent"],
				ipVersion: argv["ip-version"],
				protocol: argv["protocol"],
				normalization: argv["normalization"],
				metric: argv["metric"],
				direction: argv["direction"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar attacks layer3 timeseries",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/attacks/layer3/timeseries`,
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
