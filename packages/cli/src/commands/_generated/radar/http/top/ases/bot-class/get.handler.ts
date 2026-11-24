import operation from "../../../../../_operations/radar/http/top/ases/bot-class/get.js";
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
			command: "radar http top ases bot-class get",
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
				deviceType: argv["device-type"],
				httpProtocol: argv["http-protocol"],
				httpVersion: argv["http-version"],
				ipVersion: argv["ip-version"],
				os: argv["os"],
				tlsVersion: argv["tls-version"],
				browserFamily: argv["browser-family"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar http top ases bot-class get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/http/top/ases/bot_class/${argv["bot-class"] == null ? "<bot-class>" : encodeURIComponent(String(argv["bot-class"]))}`,
					pathParams: { "bot-class": String(argv["bot-class"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { bot_class: argv["bot-class"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
