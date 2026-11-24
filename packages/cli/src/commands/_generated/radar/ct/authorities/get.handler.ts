import operation from "../../../_operations/radar/ct/authorities/get.js";
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
			command: "radar ct authorities get",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar ct authorities get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/ct/authorities/${argv["ca-slug"] == null ? "<ca-slug>" : encodeURIComponent(String(argv["ca-slug"]))}`,
					pathParams: { "ca-slug": String(argv["ca-slug"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { ca_slug: argv["ca-slug"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
