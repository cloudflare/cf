import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * purge-environment command
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
			"$0 cache purge-environment <environment-id>\n\nDeletes cached content for one environment of the zone. Content cached for the zone's other environments, including production, is not affected. Otherwise this works like `POST /zones/{zone_id}/purge_cache`: the next request for purged content is a cache `MISS`, and the request body takes the same fields. Environments are part of [Version Management](https://developers.cloudflare.com/version-management/). To keep content cached and have Cloudflare revalidate it instead, use `POST /zones/{zone_id}/environments/{environment_id}/invalidate_cache`. Purging by URL (`files`) does not work for environments that select requests by IP address, country, ASN, or threat score, and fails with error `1136`. Use `tags`, `hosts`, `prefixes`, or `purge_everything` for those environments. ### Availability and limits Rate limits and the number of items you can send in one request depend on your plan. See [Purge cache: availability and limits](https://developers.cloudflare.com/cache/how-to/purge-cache/#availability-and-limits)."
		)
		.positional("environment-id", {
			type: "string",
			description: "The environment ID, from Version Management.",
			demandOption: true,
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

type Request = SdkRequest<"zone-environment-purge">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "purge-environment <environment-id>",
	describe: "Purge Cached Content by Environment",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache purge-environment",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cache purge-environment",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/environments/${argv["environment-id"] == null ? "<environment-id>" : encodeURIComponent(String(argv["environment-id"]))}/purge_cache`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"environment-id": String(argv["environment-id"] ?? ""),
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
						message: `This operation deletes the selected content from the environment's cache.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.cache.purgeEnvironment({
							body: bodyData,
							zone_id: zoneId,
							environment_id: argv["environment-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/zones/${argv.zoneId}/environments/${encodeURIComponent(String(argv["environment-id"]))}/purge_cache`
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
