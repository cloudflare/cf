import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel sinkholes ingresses get <ingress-id>\n\nGet the specified ingress rule associated with a sinkhole. The sinkhole must belong to the same account as the zone."
		)
		.positional("ingress-id", {
			type: "string",
			description: "The unique identifier for the ingress rule.",
			demandOption: true,
		})
		.option("sinkhole-id", {
			type: "string",
			description: "The unique identifier for the sinkhole.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"sinkhole-config-get-ingress">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <ingress-id>",
	describe: "Get an ingress rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel sinkholes ingresses get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf intel sinkholes ingresses get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/intel/sinkholes/${argv["sinkhole-id"] == null ? "<sinkhole-id>" : encodeURIComponent(String(argv["sinkhole-id"]))}/ingresses/${argv["ingress-id"] == null ? "<ingress-id>" : encodeURIComponent(String(argv["ingress-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"sinkhole-id": String(argv["sinkhole-id"] ?? ""),
							"ingress-id": String(argv["ingress-id"] ?? ""),
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
					client.intel.sinkholes.ingresses.get({
						zone_id: zoneId,
						sinkhole_id: argv["sinkhole-id"],
						ingress_id: argv["ingress-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
