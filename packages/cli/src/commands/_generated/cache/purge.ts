import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * purge command
 * @generated from apis/overlays/cache.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
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
						message: `This operation deletes the selected content from the zone's cache.`,
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
