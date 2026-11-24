import operation from "../../../_operations/cache/settings/variants/edit.js";
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
			command: "cache settings variants edit",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf cache settings variants edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/cache/variants`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									value: {
										avif: argv["value-avif"],
										bmp: argv["value-bmp"],
										gif: argv["value-gif"],
										jp2: argv["value-jp2"],
										jpeg: argv["value-jpeg"],
										jpg: argv["value-jpg"],
										jpg2: argv["value-jpg2"],
										png: argv["value-png"],
										tif: argv["value-tif"],
										tiff: argv["value-tiff"],
										webp: argv["value-webp"],
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
					avif: argv["value-avif"],
					bmp: argv["value-bmp"],
					gif: argv["value-gif"],
					jp2: argv["value-jp2"],
					jpeg: argv["value-jpeg"],
					jpg: argv["value-jpg"],
					jpg2: argv["value-jpg2"],
					png: argv["value-png"],
					tif: argv["value-tif"],
					tiff: argv["value-tiff"],
					webp: argv["value-webp"],
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
