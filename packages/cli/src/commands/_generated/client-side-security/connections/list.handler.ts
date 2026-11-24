import operation from "../../_operations/client-side-security/connections/list.js";
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
			command: "client-side-security connections list",
			classification: {
				safeFlags: [
					"order-by",
					"direction",
					"prioritize-malicious",
					"exclude-cdn-cgi",
					"export",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				exclude_urls: argv["exclude-urls"],
				urls: argv["urls"],
				hosts: argv["hosts"],
				page: argv["page"],
				per_page: argv["per-page"],
				order_by: argv["order-by"],
				direction: argv["direction"],
				prioritize_malicious: argv["prioritize-malicious"],
				exclude_cdn_cgi: argv["exclude-cdn-cgi"],
				status: argv["status"],
				page_url: argv["page-url"],
				export: argv["export"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf client-side-security connections list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/page_shield/connections`,
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
