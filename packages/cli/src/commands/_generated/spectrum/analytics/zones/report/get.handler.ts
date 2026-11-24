import operation from "../../../../_operations/spectrum/analytics/zones/report/get.js";
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
			command: "spectrum analytics zones report get",
			classification: {
				safeFlags: ["cdn-traffic", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				since: argv["since"],
				until: argv["until"],
				cdn_traffic: argv["cdn-traffic"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf spectrum analytics zones report get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/user/spectrum_analytics/zones/report`,
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
