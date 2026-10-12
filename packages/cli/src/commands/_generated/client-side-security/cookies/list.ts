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
			"$0 client-side-security cookies list\n\nLists cookies detected on the zone."
		)
		.option("hosts", {
			type: "string",
			description:
				"Includes cookies that match one or more URL-encoded hostnames separated by commas.\n\nWildcards are supported at the start and end of each hostname to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
		})
		.option("page", {
			type: "string",
			description:
				'The current page number of the paginated results.\n\nWe additionally support a special value "all". When "all" is used, the API will return all the cookies\nwith the applied filters in a single page. This feature is best-effort and it may only work for zones with\na low number of cookies',
		})
		.option("per-page", {
			type: "number",
			description: "The number of results per page.",
		})
		.option("order-by", {
			type: "string",
			description: "The field used to sort returned cookies.",
			choices: ["first_seen_at", "last_seen_at"],
		})
		.option("direction", {
			type: "string",
			description: "The direction used to sort returned cookies.'",
			choices: ["asc", "desc"],
		})
		.option("page-url", {
			type: "string",
			description:
				"Includes connections that match one or more page URLs (separated by commas) where they were last seen\n\nWildcards are supported at the start and end of each page URL to support starts with, ends with\nand contains. If no wildcards are used, results will be filtered by exact match",
		})
		.option("export", {
			type: "string",
			description:
				"Export the list of cookies as a file, limited to 50000 entries.",
			choices: ["csv"],
		})
		.option("name", {
			type: "string",
			description:
				"Filters the returned cookies that match the specified name.\nWildcards are supported at the start and end to support starts with, ends with\nand contains. e.g. session*",
		})
		.option("secure", {
			type: "boolean",
			description: "Filters the returned cookies that are set with Secure",
		})
		.option("http-only", {
			type: "boolean",
			description: "Filters the returned cookies that are set with HttpOnly",
		})
		.option("same-site", {
			type: "string",
			description:
				"Filters the returned cookies that match the specified same_site attribute",
			choices: ["lax", "strict", "none"],
		})
		.option("type", {
			type: "string",
			description:
				"Filters the returned cookies that match the specified type attribute",
			choices: ["first_party", "unknown"],
		})
		.option("path", {
			type: "string",
			description:
				"Filters the returned cookies that match the specified path attribute",
		})
		.option("domain", {
			type: "string",
			description:
				"Filters the returned cookies that match the specified domain attribute",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"page-shield-list-cookies">;
type Query = SdkQuery<"page-shield-list-cookies">;

const typedBuilder = withArgTypes<
	{
		"order-by": Query["order_by"];
		direction: Query["direction"];
		export: Query["export"];
		"same-site": Query["same_site"];
		type: Query["type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List detected cookies",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.clientSideSecurity.cookies.list({
						zone_id: zoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
