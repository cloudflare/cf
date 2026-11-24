import operation from "../../../_operations/radar/bgp/routes/realtime.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./realtime.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar bgp routes realtime",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				prefix: argv["prefix"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bgp routes realtime",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/realtime`,
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
