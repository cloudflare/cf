import operation from "../../_operations/client-side-security/scripts/list.js";
/**
 * list command
 * @generated from apis/overlays/client-side-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List detected scripts",
	usage:
		"$0 client-side-security scripts list\n\nLists scripts detected on webpages in the zone, with filtering and pagination.",
	flags: {
		"exclude-urls": {
			kind: "parsed",
			brief:
				"Excludes scripts whose URL contains one of the URL-encoded URLs separated by commas.",
			optional: true,
			parse: String,
		},
		urls: {
			kind: "parsed",
			brief:
				"Includes scripts whose URL contain one or more URL-encoded URLs separated by commas.",
			optional: true,
			parse: String,
		},
		hosts: {
			kind: "parsed",
			brief:
				"Includes scripts that match one or more URL-encoded hostnames separated by commas.\n\nWildcards are supported at the start and end of each hostname to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief:
				'The current page number of the paginated results.\n\nWe additionally support a special value "all". When "all" is used, the API will return all the scripts\nwith the applied filters in a single page. This feature is best-effort and it may only work for zones with\na low number of scripts',
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "The number of results per page.",
			optional: true,
			parse: Number,
		},
		"order-by": {
			kind: "enum",
			brief: "The field used to sort returned scripts.",
			values: ["first_seen_at", "last_seen_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "The direction used to sort returned scripts.",
			values: ["asc", "desc"],
			optional: true,
		},
		"prioritize-malicious": {
			kind: "boolean",
			brief:
				"When true, malicious scripts appear first in the returned scripts.",
			optional: true,
		},
		"exclude-cdn-cgi": {
			kind: "boolean",
			brief:
				"When true, excludes scripts seen in a `/cdn-cgi` path from the returned scripts. The default value is true.",
			optional: true,
		},
		"exclude-duplicates": {
			kind: "boolean",
			brief:
				"When true, excludes duplicate scripts. We consider a script duplicate of another if their javascript\ncontent matches and they share the same url host and zone hostname. In such case, we return the most\nrecent script for the URL host and zone hostname combination.",
			optional: true,
		},
		status: {
			kind: "parsed",
			brief:
				"Filters the returned scripts using a comma-separated list of scripts statuses. Accepted values: `active`, `infrequent`, and `inactive`. The default value is `active`.",
			optional: true,
			parse: String,
		},
		"page-url": {
			kind: "parsed",
			brief:
				"Includes scripts that match one or more page URLs (separated by commas) where they were last seen\n\nWildcards are supported at the start and end of each page URL to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
			optional: true,
			parse: String,
		},
		export: {
			kind: "enum",
			brief: "Export the list of scripts as a file, limited to 50000 entries.",
			values: ["csv"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "client-side-security scripts list",
				classification: {
					safeFlags: [
						"order-by",
						"direction",
						"prioritize-malicious",
						"exclude-cdn-cgi",
						"exclude-duplicates",
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
					exclude_duplicates: argv["exclude-duplicates"],
					status: argv["status"],
					page_url: argv["page-url"],
					export: argv["export"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf client-side-security scripts list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/page_shield/scripts`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
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
		),
});

export default command;
