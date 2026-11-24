import operation from "../../_operations/radar/dns/timeseries-groups.js";
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
			command: "radar dns timeseries-groups",
			classification: {
				safeFlags: ["agg-interval", "normalization", "format", "dry-run"],
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
				cacheHit: argv["cache-hit"],
				nodata: argv["nodata"],
				protocol: argv["protocol"],
				queryType: argv["query-type"],
				responseCode: argv["response-code"],
				responseTtl: argv["response-ttl"],
				dnssec: argv["dnssec"],
				dnssecAware: argv["dnssec-aware"],
				dnssecE2e: argv["dnssec-e2e"],
				asCategory: argv["as-category"],
				ipVersion: argv["ip-version"],
				limitPerGroup: argv["limit-per-group"],
				matchingAnswer: argv["matching-answer"],
				tld: argv["tld"],
				normalization: argv["normalization"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar dns timeseries-groups",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/dns/timeseries_groups/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
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
