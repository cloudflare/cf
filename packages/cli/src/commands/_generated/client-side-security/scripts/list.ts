import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/client-side-security.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 client-side-security scripts list\n\nLists scripts detected on webpages in the zone, with filtering and pagination."
		)
		.option("exclude-urls", {
			type: "string",
			description:
				"Excludes scripts whose URL contains one of the URL-encoded URLs separated by commas.",
		})
		.option("urls", {
			type: "string",
			description:
				"Includes scripts whose URL contain one or more URL-encoded URLs separated by commas.",
		})
		.option("hosts", {
			type: "string",
			description:
				"Includes scripts that match one or more URL-encoded hostnames separated by commas.\n\nWildcards are supported at the start and end of each hostname to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
		})
		.option("page", {
			type: "string",
			description:
				'The current page number of the paginated results.\n\nWe additionally support a special value "all". When "all" is used, the API will return all the scripts\nwith the applied filters in a single page. This feature is best-effort and it may only work for zones with\na low number of scripts',
		})
		.option("per-page", {
			type: "number",
			description: "The number of results per page.",
		})
		.option("order-by", {
			type: "string",
			description: "The field used to sort returned scripts.",
			choices: ["first_seen_at", "last_seen_at"],
		})
		.option("direction", {
			type: "string",
			description: "The direction used to sort returned scripts.",
			choices: ["asc", "desc"],
		})
		.option("prioritize-malicious", {
			type: "boolean",
			description:
				"When true, malicious scripts appear first in the returned scripts.",
		})
		.option("exclude-cdn-cgi", {
			type: "boolean",
			description:
				"When true, excludes scripts seen in a `/cdn-cgi` path from the returned scripts. The default value is true.",
		})
		.option("exclude-duplicates", {
			type: "boolean",
			description:
				"When true, excludes duplicate scripts. We consider a script duplicate of another if their javascript\ncontent matches and they share the same url host and zone hostname. In such case, we return the most\nrecent script for the URL host and zone hostname combination.",
		})
		.option("status", {
			type: "string",
			description:
				"Filters the returned scripts using a comma-separated list of scripts statuses. Accepted values: `active`, `infrequent`, and `inactive`. The default value is `active`.",
		})
		.option("page-url", {
			type: "string",
			description:
				"Includes scripts that match one or more page URLs (separated by commas) where they were last seen\n\nWildcards are supported at the start and end of each page URL to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
		})
		.option("export", {
			type: "string",
			description:
				"Export the list of scripts as a file, limited to 50000 entries.",
			choices: ["csv"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"page-shield-list-scripts">;
type Query = SdkQuery<"page-shield-list-scripts">;

const typedBuilder = withArgTypes<
	{
		"order-by": Query["order_by"];
		direction: Query["direction"];
		export: Query["export"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List detected scripts",
	builder: typedBuilder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.clientSideSecurity.scripts.list({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
