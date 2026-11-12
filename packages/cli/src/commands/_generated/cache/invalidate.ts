import operation from "../_operations/cache/invalidate.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * invalidate command
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
			"$0 cache invalidate\n\nMarks cached content as stale in every Cloudflare data center and cache tier, including Cache Reserve. The content stays in cache. The next request for it makes Cloudflare revalidate it with your origin, using the `ETag` and `Last-Modified` values it was cached with: - If your origin answers `304 Not Modified`, Cloudflare serves the cached copy without downloading it again, and `CF-Cache-Status` is `REVALIDATED`. - If your origin sends a full response, Cloudflare serves and caches the new content, and `CF-Cache-Status` is `EXPIRED`. With Tiered Cache, each tier revalidates with the tier above it, so a visitor can see `EXPIRED` even when your origin answered `304`. Until content is revalidated, your `stale-while-revalidate` and `stale-if-error` directives still apply, counted from the time you invalidated it. For example, if your origin fails during revalidation, Cloudflare can keep serving the stale copy for the `stale-if-error` window. ### Invalidate or purge? - **Invalidate** when content may not have changed, for example after a deploy. Unchanged content costs your origin a `304` instead of a full response. That saving needs an origin that sends `ETag` or `Last-Modified` and answers conditional requests. Otherwise, every revalidation downloads the full response. - **Purge**, with `POST /zones/{zone_id}/purge_cache`, when content must not be served again, for example content you removed for legal or security reasons. Invalidating takes the same request bodies as purging, needs the same permission, and counts against the same rate limits. After a broad invalidation, such as `purge_everything`, expect more conditional requests to your origin while visitors request the invalidated content again. ### Choose what to invalidate Send one of these fields in the request body: - `files`: specific URLs. If your cache key includes request headers, send each URL with the header values it was cached with. - `tags`: all content whose `Cache-Tag` response header contains one of the tags. - `hosts`: all content cached for the hostnames. - `prefixes`: all content whose URL starts with one of the prefixes. - `purge_everything`: all cached content in the zone. ### Check the result A `200` response with `success: true` means Cloudflare accepted the request. To check, request an invalidated URL and confirm that the `CF-Cache-Status` response header is `REVALIDATED` or `EXPIRED`. ### Availability and limits Rate limits and the number of items you can send in one request depend on your plan. See [Purge cache: availability and limits](https://developers.cloudflare.com/cache/how-to/purge-cache/#availability-and-limits)."
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
	command: "invalidate",
	describe: "Invalidate Cached Content",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache invalidate",
				classification: {
					safeFlags: ["purge-everything", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cache invalidate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/invalidate_cache`,
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
						message: `This operation marks the selected content in the zone's cache as stale.`,
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
