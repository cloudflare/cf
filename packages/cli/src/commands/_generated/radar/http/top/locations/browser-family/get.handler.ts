import operation from "../../../../../_operations/radar/http/top/locations/browser-family/get.js";
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
			command: "radar http top locations browser-family get",
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
				asn: argv["asn"],
				location: argv["location"],
				continent: argv["continent"],
				geoId: argv["geo-id"],
				asCategory: argv["as-category"],
				botClass: argv["bot-class"],
				deviceType: argv["device-type"],
				httpProtocol: argv["http-protocol"],
				httpVersion: argv["http-version"],
				ipVersion: argv["ip-version"],
				os: argv["os"],
				tlsVersion: argv["tls-version"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar http top locations browser-family get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/http/top/locations/browser_family/${argv["browser-family"] == null ? "<browser-family>" : encodeURIComponent(String(argv["browser-family"]))}`,
					pathParams: {
						"browser-family": String(argv["browser-family"] ?? ""),
					},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					browser_family: argv["browser-family"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
