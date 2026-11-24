import operation from "../../../_operations/radar/ranking/domain/get.js";
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
			command: "radar ranking domain get",
			classification: {
				safeFlags: [
					"ranking-type",
					"include-top-locations",
					"format",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				limit: argv["limit"],
				rankingType: argv["ranking-type"],
				name: argv["name"],
				includeTopLocations: argv["include-top-locations"],
				date: argv["date"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar ranking domain get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/ranking/domain/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}`,
					pathParams: { domain: String(argv["domain"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { domain: argv["domain"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
