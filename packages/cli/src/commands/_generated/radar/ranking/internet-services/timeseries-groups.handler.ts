import operation from "../../../_operations/radar/ranking/internet-services/timeseries-groups.js";
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
			command: "radar ranking internet-services timeseries-groups",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				serviceCategory: argv["service-category"],
				limit: argv["limit"],
				name: argv["name"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar ranking internet-services timeseries-groups",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/ranking/internet_services/timeseries_groups`,
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
