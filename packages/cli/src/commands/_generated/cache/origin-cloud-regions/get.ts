import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/cache.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cache origin-cloud-regions get <origin-ip>\n\nReturns the cloud region mapping for a single origin IP address. The IP path parameter is normalized before lookup (RFC 5952 for IPv6). Returns 404 if the zone has no mappings or if the specified IP has no mapping."
		)
		.positional("origin-ip", {
			type: "string",
			description: "Origin IP address to look up. IPv4 and IPv6 are supported.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"origin-cloud-regions-v2-get">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <origin-ip>",
	describe: "Get an origin cloud region mapping",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache origin-cloud-regions get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cache origin-cloud-regions get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin/cloud_regions/${argv["origin-ip"] == null ? "<origin-ip>" : encodeURIComponent(String(argv["origin-ip"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"origin-ip": String(argv["origin-ip"] ?? ""),
						},
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
					client.cache.originCloudRegions.get({
						zone_id: zoneId,
						origin_ip: argv["origin-ip"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
