import operation from "../../../../../_operations/radar/attacks/layer7/top/locations/origin.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./origin.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "radar attacks layer7 top locations origin",
			classification: {
				safeFlags: ["format", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				limit: argv["limit"],
				name: argv["name"],
				dateRange: argv["date-range"],
				dateStart: argv["date-start"],
				dateEnd: argv["date-end"],
				asn: argv["asn"],
				continent: argv["continent"],
				ipVersion: argv["ip-version"],
				httpVersion: argv["http-version"],
				httpMethod: argv["http-method"],
				mitigationProduct: argv["mitigation-product"],
				asCategory: argv["as-category"],
				format: argv["format"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf radar attacks layer7 top locations origin",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/radar/attacks/layer7/top/locations/origin`,
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
