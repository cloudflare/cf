import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/waiting-rooms.ts
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
			"$0 waiting-rooms settings get\n\nGet zone-level Waiting Room settings."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"waiting-room-get-zone-settings">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get zone-level Waiting Room settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "waiting-rooms settings get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf waiting-rooms settings get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/settings`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
					client.waitingRooms.settings.get({
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
