import operation from "../../../_operations/radar/bgp/routes/ases.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./ases.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar bgp routes ases",
			classification: {
				safeFlags: ["sort-by", "sort-order", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				location: argv["location"],
				limit: argv["limit"],
				sortBy: argv["sort-by"],
				sortOrder: argv["sort-order"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bgp routes ases",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/ases`,
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
