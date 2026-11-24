import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./export.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "dns records export",
			classification: {
				safeFlags: [
					"include-generated-records",
					"type",
					"proxied",
					"match",
					"tag-match",
					"include-shadow-metadata",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				include_generated_records: argv["include-generated-records"],
				name: argv["name"],
				"name.exact": argv["name-exact"],
				"name.contains": argv["name-contains"],
				"name.startswith": argv["name-startswith"],
				"name.endswith": argv["name-endswith"],
				type: argv["type"],
				content: argv["content"],
				"content.exact": argv["content-exact"],
				"content.contains": argv["content-contains"],
				"content.startswith": argv["content-startswith"],
				"content.endswith": argv["content-endswith"],
				proxied: argv["proxied"],
				match: argv["match"],
				comment: argv["comment"],
				"comment.present": argv["comment-present"],
				"comment.absent": argv["comment-absent"],
				"comment.exact": argv["comment-exact"],
				"comment.contains": argv["comment-contains"],
				"comment.startswith": argv["comment-startswith"],
				"comment.endswith": argv["comment-endswith"],
				tag: argv["tag"],
				"tag.present": argv["tag-present"],
				"tag.absent": argv["tag-absent"],
				"tag.exact": argv["tag-exact"],
				"tag.contains": argv["tag-contains"],
				"tag.startswith": argv["tag-startswith"],
				"tag.endswith": argv["tag-endswith"],
				search: argv["search"],
				tag_match: argv["tag-match"],
				include_shadow_metadata: argv["include-shadow-metadata"],
				shadowed_by_name: argv["shadowed-by-name"],
				shadowing_name: argv["shadowing-name"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf dns records export",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records/export`,
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

			const qs = new URLSearchParams(
				Object.entries(queryParams)
					.filter(([, v]) => v !== undefined)
					.map(([k, v]) => [k, String(v)])
			).toString();
			const __cfRawBytes = await withProgress(`Loading`, async () =>
				fetchRawBytes(
					`/zones/${argv.zoneId}/dns_records/export${qs ? "?" + qs : ""}`,
					{
						method: "GET",
						local: argv.local === true,
						persistTo: argv.persistTo as string | undefined,
					}
				)
			);
			writeRawOutput(__cfRawBytes.toString("utf-8"));
			return;
		}
	);
}
