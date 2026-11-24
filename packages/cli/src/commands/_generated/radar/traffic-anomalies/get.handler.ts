import operation from "../../_operations/radar/traffic-anomalies/get.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar traffic-anomalies get",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar traffic-anomalies get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/traffic_anomalies/${argv["uuid"] == null ? "<uuid>" : encodeURIComponent(String(argv["uuid"]))}`,
					pathParams: { uuid: String(argv["uuid"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { uuid: argv["uuid"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
