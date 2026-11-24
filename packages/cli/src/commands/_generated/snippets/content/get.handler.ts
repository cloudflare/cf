import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "snippets content get",
			classification: {
				safeFlags: ["dry-run", "text"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				formatDryRun({
					command: "cf snippets content get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/snippets/${argv["snippet-name"] == null ? "<snippet-name>" : encodeURIComponent(String(argv["snippet-name"]))}/content`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"snippet-name": String(argv["snippet-name"] ?? ""),
					},
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const zoneId = await getZoneId({ zone: argv.zone }, client, {
				quiet: argv.quiet,
			});
			argv.zoneId = zoneId;

			const __cfRawBytes = await withProgress(`Loading`, async () =>
				fetchRawBytes(
					`/zones/${argv.zoneId}/snippets/${encodeURIComponent(String(argv["snippet-name"]))}/content`,
					{
						method: "GET",
						local: argv.local === true,
						persistTo: argv.persistTo as string | undefined,
					}
				)
			);
			writeRawOutput(
				argv.text === true ? __cfRawBytes.toString("utf-8") : __cfRawBytes
			);
			return;
		}
	);
}
