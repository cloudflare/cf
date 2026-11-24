import operation from "../../_operations/dns/records/list.js";
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
			command: "dns records list",
			classification: {
				safeFlags: [
					"type",
					"proxied",
					"match",
					"tag-match",
					"order",
					"direction",
					"include-shadow-metadata",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
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
				cursor: argv["cursor"],
				prev_cursor: argv["prev-cursor"],
				page: argv["page"],
				per_page: argv["per-page"],
				order: argv["order"],
				direction: argv["direction"],
				include_shadow_metadata: argv["include-shadow-metadata"],
				shadowed_by_name: argv["shadowed-by-name"],
				shadowing_name: argv["shadowing-name"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf dns records list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/dns_records`,
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
