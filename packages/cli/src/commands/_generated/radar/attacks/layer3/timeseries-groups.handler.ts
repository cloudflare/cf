import operation from "../../../_operations/radar/attacks/layer3/timeseries-groups.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./timeseries-groups.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar attacks layer3 timeseries-groups",
			classification: {
				safeFlags: [
					"agg-interval",
					"normalization",
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
				location: argv["location"],
				continent: argv["continent"],
				ipVersion: argv["ip-version"],
				protocol: argv["protocol"],
				normalization: argv["normalization"],
				direction: argv["direction"],
				limitPerGroup: argv["limit-per-group"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar attacks layer3 timeseries-groups",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/attacks/layer3/timeseries_groups/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
					pathParams: { dimension: String(argv["dimension"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { dimension: argv["dimension"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
