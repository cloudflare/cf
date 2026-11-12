import operation from "../_operations/cache/purge.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * purge command
 * @generated from apis/overlays/cache.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cache purge\n\nDeletes cached content in every Cloudflare data center and cache tier, including Cache Reserve. The next request for purged content is a cache `MISS`: Cloudflare fetches the full response from your origin and caches it again. Cloudflare does not serve purged content from cache again, even if your origin is unavailable. To keep content cached and have Cloudflare revalidate it with your origin instead, use `POST /zones/{zone_id}/invalidate_cache`. ### Choose what to purge Send one of these fields in the request body: - `files`: specific URLs. If your cache key includes request headers, send each URL with the header values it was cached with. - `tags`: all content whose `Cache-Tag` response header contains one of the tags. - `hosts`: all content cached for the hostnames. - `prefixes`: all content whose URL starts with one of the prefixes. - `purge_everything`: all cached content in the zone. ### Check the result A `200` response with `success: true` means Cloudflare accepted the request. It does not confirm that any content was cached or removed. To check, request a purged URL and confirm that the `CF-Cache-Status` response header is `MISS`. ### Availability and limits Rate limits and the number of items you can send in one request depend on your plan. See [Purge cache: availability and limits](https://developers.cloudflare.com/cache/how-to/purge-cache/#availability-and-limits)."
		)
		.option("tags", {
			type: "string",
			array: true,
			description:
				"Cache tags. Targets all content whose `Cache-Tag` response header contains at least one of these tags. See [Purge cache by cache-tags](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-tags/).",
		})
		.option("hosts", {
			type: "string",
			array: true,
			description:
				"Hostnames, such as `www.example.com`. Targets all content cached for these hostnames. See [Purge cache by hostname](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-hostname/).",
		})
		.option("prefixes", {
			type: "string",
			array: true,
			description:
				"URL prefixes, each a hostname followed by a path, such as `www.example.com/blog/`. Targets all content whose URL starts with one of these prefixes. Do not include a scheme, query string, or fragment. See [Purge cache by prefix](https://developers.cloudflare.com/cache/how-to/purge-cache/purge_by_prefix/).",
		})
		.option("purge-everything", {
			type: "boolean",
			description:
				"Set to `true` to target all cached content in the zone, or in the environment for the environment endpoints. Must be the only field in the request. See [Purge everything](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-everything/).",
		})
		.option("files", {
			type: "string",
			array: true,
			description:
				"Full URLs, such as `https://www.example.com/css/styles.css`. Targets the content cached for each URL. If your cache key includes request headers, send objects with `url` and `headers` instead. See [Purge by single-file](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-single-file/).",
		})
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "purge",
	describe: "Purge Cached Content",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache purge",
				classification: {
					safeFlags: ["purge-everything", "dry-run", "force"],
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
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										tags: argv["tags"],
										hosts: argv["hosts"],
										prefixes: argv["prefixes"],
										purge_everything: argv["purge-everything"],
										files: argv["files"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation deletes the selected content from the zone's cache.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Processing`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Done` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					tags: argv["tags"],
					hosts: argv["hosts"],
					prefixes: argv["prefixes"],
					purge_everything: argv["purge-everything"],
					files: argv["files"],
				});
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Done` });
			}
		),
};

export default command;
