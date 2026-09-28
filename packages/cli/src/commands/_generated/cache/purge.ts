import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * purge command
 * @generated from apis/overlays/cache.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 cache purge\n\n### Purge All Cached Content Removes ALL files from Cloudflare\'s cache. All tiers can purge everything. ``` {"purge_everything": true} ``` ### Purge Cached Content by URL Granularly removes one or more files from Cloudflare\'s cache by specifying URLs. All tiers can purge by URL. To purge files with custom cache keys, include the headers used to compute the cache key as in the example. If you have a device type or geo in your cache key, you will need to include the CF-Device-Type or CF-IPCountry headers. If you have lang in your cache key, you will need to include the Accept-Language header. **NB:** When including the Origin header, be sure to include the **scheme** and **hostname**. The port number can be omitted if it is the default port (80 for http, 443 for https), but must be included otherwise. Single file purge example with files: ``` {"files": ["http://www.example.com/css/styles.css", "http://www.example.com/js/index.js"]} ``` Single file purge example with url and header pairs: ``` {"files": [{"url": "http://www.example.com/cat_picture.jpg", "headers": {"CF-IPCountry": "US", "CF-Device-Type": "desktop", "Accept-Language": "zh-CN"}}, {"url": "http://www.example.com/dog_picture.jpg", "headers": {"CF-IPCountry": "EU", "CF-Device-Type": "mobile", "Accept-Language": "en-US"}}]} ``` ### Purge Cached Content by Tag, Host or Prefix Granularly removes one or more files from Cloudflare\'s cache either by specifying the host, the associated Cache-Tag, or a Prefix. Flex purge with tags: ``` {"tags": ["a-cache-tag", "another-cache-tag"]} ``` Flex purge with hosts: ``` {"hosts": ["www.example.com", "images.example.com"]} ``` Flex purge with prefixes: ``` {"prefixes": ["www.example.com/foo", "images.example.com/bar/baz"]} ``` ### Availability and limits Please refer to [purge cache availability and limits documentation page](https://developers.cloudflare.com/cache/how-to/purge-cache/#availability-and-limits).'
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"zone-purge">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "purge",
	describe: "Purge Cached Content",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache purge",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cache purge",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/purge_cache`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
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
						message: `This operation will delete cached content for the zone.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.cache.purge({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/zones/${argv.zoneId}/purge_cache`
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
