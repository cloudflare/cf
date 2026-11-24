import operation from "../../_operations/radar/bots/timeseries.js";
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
			command: "radar bots timeseries",
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
				bot: argv["bot"],
				botOperator: argv["bot-operator"],
				botCategory: argv["bot-category"],
				botKind: argv["bot-kind"],
				botVerificationStatus: argv["bot-verification-status"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bots timeseries",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bots/timeseries`,
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
