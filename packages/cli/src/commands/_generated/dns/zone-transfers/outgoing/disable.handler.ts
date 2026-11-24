import operation from "../../../_operations/dns/zone-transfers/outgoing/disable.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./disable.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "dns zone-transfers outgoing disable",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf dns zone-transfers outgoing disable",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/secondary_dns/outgoing/disable`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `This operation turns off outgoing zone transfers for the primary zone, which means secondary zones will stop receiving updates.`,
				}))
			) {
				return;
			}

			const result = await withProgress(`Processing`, async () =>
				client.send(operation, { zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Done` });
		}
	);
}
