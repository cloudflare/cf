import operation from "../../_operations/waiting-rooms/events/get.js";
/**
 * get command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <event-id>",
	describe: "Event details",
	usage:
		"$0 waiting-rooms events get <event-id>\n\nFetches a single configured event for a waiting room.",
	flags: {
		"waiting-room-id": {
			kind: "parsed",
			brief: "Waiting room ID",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "event-id", brief: "Event ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "waiting-rooms events get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf waiting-rooms events get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/${argv["waiting-room-id"] == null ? "<waiting-room-id>" : encodeURIComponent(String(argv["waiting-room-id"]))}/events/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"waiting-room-id": String(argv["waiting-room-id"] ?? ""),
							"event-id": String(argv["event-id"] ?? ""),
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
					client.send(operation, {
						zone_id: zoneId,
						waiting_room_id: argv["waiting-room-id"],
						event_id: argv["event-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
