import operation from "../../../_operations/radar/entities/asns/get.js";
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
			command: "radar entities asns get",
			classification: {
				safeFlags: ["include-confidence-level", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				includeConfidenceLevel: argv["include-confidence-level"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar entities asns get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/entities/asns/${argv["asn"] == null ? "<asn>" : encodeURIComponent(String(argv["asn"]))}`,
					pathParams: { asn: String(argv["asn"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { asn: argv["asn"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
