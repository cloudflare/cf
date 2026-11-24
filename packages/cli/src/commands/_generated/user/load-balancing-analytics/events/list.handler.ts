import operation from "../../../_operations/user/load-balancing-analytics/events/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "user load-balancing-analytics events list",
			classification: {
				safeFlags: ["origin-healthy", "pool-healthy", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				until: argv["until"],
				pool_name: argv["pool-name"],
				origin_healthy: argv["origin-healthy"],
				pool_id: argv["pool-id"],
				since: argv["since"],
				origin_name: argv["origin-name"],
				pool_healthy: argv["pool-healthy"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf user load-balancing-analytics events list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/user/load_balancing_analytics/events`,
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
