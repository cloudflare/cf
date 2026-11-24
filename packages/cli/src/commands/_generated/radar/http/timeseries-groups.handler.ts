import operation from "../../_operations/radar/http/timeseries-groups.js";
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
			command: "radar http timeseries-groups",
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
				geoId: argv["geo-id"],
				apiTraffic: argv["api-traffic"],
				asCategory: argv["as-category"],
				botClass: argv["bot-class"],
				contentType: argv["content-type"],
				limitPerGroup: argv["limit-per-group"],
				deviceType: argv["device-type"],
				httpProtocol: argv["http-protocol"],
				httpVersion: argv["http-version"],
				normalization: argv["normalization"],
				ipVersion: argv["ip-version"],
				os: argv["os"],
				tlsVersion: argv["tls-version"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar http timeseries-groups",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/http/timeseries_groups/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
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
