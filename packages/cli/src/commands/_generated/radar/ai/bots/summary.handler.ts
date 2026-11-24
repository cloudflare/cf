import operation from "../../../_operations/radar/ai/bots/summary.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./summary.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar ai bots summary",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				name: argv["name"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				asn: argv["asn"],
				location: argv["location"],
				continent: argv["continent"],
				crawlPurpose: argv["crawl-purpose"],
				userAgent: argv["user-agent"],
				vertical: argv["vertical"],
				industry: argv["industry"],
				contentType: argv["content-type"],
				responseStatus: argv["response-status"],
				responseStatusCategory: argv["response-status-category"],
				limitPerGroup: argv["limit-per-group"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar ai bots summary",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/ai/bots/summary/${argv["dimension"] == null ? "<dimension>" : encodeURIComponent(String(argv["dimension"]))}`,
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
