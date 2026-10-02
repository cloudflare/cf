import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * bulk-update command
 * @generated from apis/overlays/cache.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cache origin-cloud-regions bulk-update\n\nUpserts up to 100 IP-to-cloud-region mappings in a single request. Items in the request body are created or replaced; mappings not included in the request body are preserved unchanged (this is a merge operation, not a full collection replacement). Each item is validated independently — valid items are applied and invalid items are returned in the `failed` array. The vendor and region for every item are validated against the list from `GET /zones/{zone_id}/origin/cloud_regions/supported_regions`."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"origin-cloud-regions-v2-batch-upsert">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "bulk-update",
	describe: "Batch create or replace origin cloud region mappings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache origin-cloud-regions bulk-update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cache origin-cloud-regions bulk-update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin/cloud_regions/batch`,
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

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					if (Array.isArray(bodyData) && bodyData.length > 100) {
						const total = Math.ceil(bodyData.length / 100);
						let result: unknown = null;
						for (let i = 0; i < bodyData.length; i += 100) {
							const batch = bodyData.slice(i, i + 100);
							const batchNum = Math.floor(i / 100) + 1;
							result = await withProgress(
								`Updating: batch ${batchNum}/${total}`,
								async () =>
									requestApi<unknown>(
										client,
										"PUT",
										`/zones/${argv.zoneId}/origin/cloud_regions/batch`,
										{ body: batch }
									)
							);
						}
						formatOutput(result, { successLabel: `Updated` });
						return;
					}
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/zones/${argv.zoneId}/origin/cloud_regions/batch`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
