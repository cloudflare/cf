import operation from "../../../_operations/radar/bgp/routes/moas.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./moas.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar bgp routes moas",
			classification: {
				safeFlags: ["invalid-only", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				origin: argv["origin"],
				prefix: argv["prefix"],
				invalid_only: argv["invalid-only"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bgp routes moas",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/moas`,
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
