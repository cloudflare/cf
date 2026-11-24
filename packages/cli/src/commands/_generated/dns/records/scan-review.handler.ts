import operation from "../../_operations/dns/records/scan-review.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./scan-review.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "dns records scan-review",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf dns records scan-review",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/scan/review`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									accepts: parseObjectArray(argv["accepts"], "accepts"),
									rejects: parseObjectArray(argv["rejects"], "rejects"),
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				accepts: parseObjectArray(argv["accepts"], "accepts"),
				rejects: parseObjectArray(argv["rejects"], "rejects"),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
