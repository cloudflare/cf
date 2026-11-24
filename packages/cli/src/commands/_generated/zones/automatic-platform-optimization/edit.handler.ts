import operation from "../../_operations/zones/automatic-platform-optimization/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zones automatic-platform-optimization edit",
			classification: {
				safeFlags: [
					"value-cache-by-device-type",
					"value-cf",
					"value-enabled",
					"value-recheck",
					"value-wordpress",
					"value-wp-plugin",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf zones automatic-platform-optimization edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/automatic_platform_optimization`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									value: {
										cache_by_device_type: argv["value-cache-by-device-type"],
										cf: argv["value-cf"],
										enabled: argv["value-enabled"],
										hostnames: argv["value-hostnames"],
										recheck: argv["value-recheck"],
										wordpress: argv["value-wordpress"],
										wp_plugin: argv["value-wp-plugin"],
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
				value: {
					cache_by_device_type: argv["value-cache-by-device-type"],
					cf: argv["value-cf"],
					enabled: argv["value-enabled"],
					hostnames: argv["value-hostnames"],
					recheck: argv["value-recheck"],
					wordpress: argv["value-wordpress"],
					wp_plugin: argv["value-wp-plugin"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
