import operation from "../../../_operations/o11y/tracing/settings/update.js";
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
			command: "o11y tracing settings update",
			classification: {
				safeFlags: [
					"enabled",
					"forward-context",
					"persist",
					"propagation-policy",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf o11y tracing settings update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/observability/tracing/settings`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									destinations: argv["destinations"],
									enabled: argv["enabled"],
									forward_context: argv["forward-context"],
									persist: argv["persist"],
									propagation_policy: argv["propagation-policy"],
									sampling_ratio: argv["sampling-ratio"],
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
				destinations: argv["destinations"],
				enabled: argv["enabled"],
				forward_context: argv["forward-context"],
				persist: argv["persist"],
				propagation_policy: argv["propagation-policy"],
				sampling_ratio: argv["sampling-ratio"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
