import operation from "../../../../../_operations/radar/as112/top/locations/dnssec/get.js";
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
			command: "radar as112 top locations dnssec get",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				limit: argv["limit"],
				name: argv["name"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				location: argv["location"],
				continent: argv["continent"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar as112 top locations dnssec get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/as112/top/locations/dnssec/${argv["dnssec"] == null ? "<dnssec>" : encodeURIComponent(String(argv["dnssec"]))}`,
					pathParams: { dnssec: String(argv["dnssec"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { dnssec: argv["dnssec"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
