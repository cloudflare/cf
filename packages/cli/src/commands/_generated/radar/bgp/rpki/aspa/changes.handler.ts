import operation from "../../../../_operations/radar/bgp/rpki/aspa/changes.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./changes.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar bgp rpki aspa changes",
			classification: {
				safeFlags: ["include-asn-info", "format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				asn: argv["asn"],
				includeAsnInfo: argv["include-asn-info"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar bgp rpki aspa changes",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/bgp/rpki/aspa/changes`,
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
