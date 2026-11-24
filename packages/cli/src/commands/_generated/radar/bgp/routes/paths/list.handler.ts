import operation from "../../../../_operations/radar/bgp/routes/paths/list.js";
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
			command: "radar bgp routes paths list",
			classification: {
				safeFlags: ["ip-version", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				ipVersion: argv["ip-version"],
				collector: argv["collector"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bgp routes paths list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bgp/routes/paths/${argv["asn"] == null ? "<asn>" : encodeURIComponent(String(argv["asn"]))}`,
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
