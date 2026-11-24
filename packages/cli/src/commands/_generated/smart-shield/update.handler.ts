import operation from "../_operations/smart-shield/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "smart-shield update",
			classification: {
				safeFlags: [
					"cache-reserve-value",
					"regional-tiered-cache-value",
					"smart-routing-value",
					"smart-tiered-cache-value",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf smart-shield update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/smart_shield`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									cache_reserve: {
										value: argv["cache-reserve-value"],
									},
									regional_tiered_cache: {
										value: argv["regional-tiered-cache-value"],
									},
									smart_routing: {
										value: argv["smart-routing-value"],
									},
									smart_tiered_cache: {
										value: argv["smart-tiered-cache-value"],
									},
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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				cache_reserve: {
					value: argv["cache-reserve-value"],
				},
				regional_tiered_cache: {
					value: argv["regional-tiered-cache-value"],
				},
				smart_routing: {
					value: argv["smart-routing-value"],
				},
				smart_tiered_cache: {
					value: argv["smart-tiered-cache-value"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
