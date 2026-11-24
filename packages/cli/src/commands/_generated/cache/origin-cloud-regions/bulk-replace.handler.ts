import operation from "../../_operations/cache/origin-cloud-regions/bulk-replace.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./bulk-replace.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cache origin-cloud-regions bulk-replace",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.body === undefined) {
				throw new Error(
					"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
				);
			}
			if (argv.dryRun) {
				formatDryRun({
					command: "cf cache origin-cloud-regions bulk-replace",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin/cloud_regions/batch`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined ? parseBody(argv.body, [], 100) : undefined,
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body, [], 100) : undefined;
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
		}
	);
}
