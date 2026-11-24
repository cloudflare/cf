import operation from "../../../_operations/radar/bgp/routes/pfx2as.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./pfx2as.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar bgp routes pfx2as",
			classification: {
				safeFlags: ["rpki-status", "longest-prefix-match", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				prefix: argv["prefix"],
				origin: argv["origin"],
				rpkiStatus: argv["rpki-status"],
				longestPrefixMatch: argv["longest-prefix-match"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bgp routes pfx2as",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/pfx2as`,
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
