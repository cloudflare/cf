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
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 waiting-rooms statuses get <waiting-room-id>\n\nFetches the status of a configured waiting room. Response fields include: 1. `status`: String indicating the status of the waiting room. The possible status are: - **not_queueing** indicates that the configured thresholds have not been met and all users are going through to the origin. - **queueing** indicates that the thresholds have been met and some users are held in the waiting room. - **event_prequeueing** indicates that an event is active and is currently prequeueing users before it starts. - **suspended** indicates that the room is suspended. 2. `event_id`: String of the current event's `id` if an event is active, otherwise an empty string. 3. `estimated_queued_users`: Integer of the estimated number of users currently waiting in the queue. 4. `estimated_total_active_users`: Integer of the estimated number of users currently active on the origin. 5. `max_estimated_time_minutes`: Integer of the maximum estimated time currently presented to the users."
		)
		.positional("waiting-room-id", {
			type: "string",
			description: "Waiting room ID",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"waiting-room-get-waiting-room-status">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <waiting-room-id>",
	describe: "Get waiting room status",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "waiting-rooms statuses get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf waiting-rooms statuses get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/${argv["waiting-room-id"] == null ? "<waiting-room-id>" : encodeURIComponent(String(argv["waiting-room-id"]))}/status`,
						pathParams: {
							"waiting-room-id": String(argv["waiting-room-id"] ?? ""),
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
					client.waitingRooms.statuses.get({
						zone_id: zoneId,
						waiting_room_id: argv["waiting-room-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
