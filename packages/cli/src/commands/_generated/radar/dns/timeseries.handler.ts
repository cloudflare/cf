import operation from "../../_operations/radar/dns/timeseries.js";
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
			command: "radar dns timeseries",
			classification: {
				safeFlags: ["agg-interval", "format", "dry-run"],
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
				matchingAnswer: argv["matching-answer"],
				tld: argv["tld"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar dns timeseries",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/dns/timeseries`,
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
