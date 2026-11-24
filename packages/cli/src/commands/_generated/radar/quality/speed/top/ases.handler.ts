import operation from "../../../../_operations/radar/quality/speed/top/ases.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./ases.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar quality speed top ases",
			classification: {
				safeFlags: ["order-by", "reverse", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				limit: argv["limit"],
				name: argv["name"],
				dateEnd: argv["date-end"],
				asn: argv["asn"],
				location: argv["location"],
				continent: argv["continent"],
				orderBy: argv["order-by"],
				reverse: argv["reverse"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar quality speed top ases",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/quality/speed/top/ases`,
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
