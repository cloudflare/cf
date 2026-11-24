import operation from "../_operations/custom-hostnames/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "custom-hostnames list",
			classification: {
				safeFlags: [
					"order",
					"direction",
					"ssl-status",
					"hostname-status",
					"certificate-authority",
					"wildcard",
					"ssl",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				hostname: argv["hostname"],
				"hostname.exact": argv["hostname-exact"],
				"hostname.startsWith": argv["hostname-starts-with"],
				"hostname.contain": argv["hostname-contain"],
				id: argv["id"],
				page: argv["page"],
				per_page: argv["per-page"],
				order: argv["order"],
				direction: argv["direction"],
				ssl_status: argv["ssl-status"],
				hostname_status: argv["hostname-status"],
				certificate_authority: argv["certificate-authority"],
				wildcard: argv["wildcard"],
				custom_origin_server: argv["custom-origin-server"],
				ssl: argv["ssl"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf custom-hostnames list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/custom_hostnames`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { zone_id: zoneId, ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
