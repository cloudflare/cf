import operation from "../../_operations/client-side-security/cookies/list.js";
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
			command: "client-side-security cookies list",
			classification: {
				safeFlags: [
					"order-by",
					"direction",
					"export",
					"secure",
					"http-only",
					"same-site",
					"type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				hosts: argv["hosts"],
				page: argv["page"],
				per_page: argv["per-page"],
				order_by: argv["order-by"],
				direction: argv["direction"],
				page_url: argv["page-url"],
				export: argv["export"],
				name: argv["name"],
				secure: argv["secure"],
				http_only: argv["http-only"],
				same_site: argv["same-site"],
				type: argv["type"],
				path: argv["path"],
				domain: argv["domain"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf client-side-security cookies list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/page_shield/cookies`,
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
