import operation from "../../_operations/radar/annotations/list.js";
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
			command: "radar annotations list",
			classification: {
				safeFlags: [
					"data-source",
					"event-type",
					"outage-type",
					"outage-cause",
					"format",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				limit: argv["limit"],
				offset: argv["offset"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				dataSource: argv["data-source"],
				eventType: argv["event-type"],
				outageType: argv["outage-type"],
				outageCause: argv["outage-cause"],
				tags: argv["tags"],
				query: argv["query"],
				asn: argv["asn"],
				location: argv["location"],
				geoId: argv["geo-id"],
				origin: argv["origin"],
				tld: argv["tld"],
				ca: argv["ca"],
				log: argv["log"],
				bot: argv["bot"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar annotations list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/annotations`,
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
