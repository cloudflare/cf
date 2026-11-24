import operation from "../../_operations/waiting-rooms/events/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "waiting-rooms events update",
			classification: {
				safeFlags: [
					"disable-session-renewal",
					"shuffle-at-event-start",
					"suspended",
					"turnstile-action",
					"turnstile-mode",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["event-end-time"] === undefined) {
					argv["event-end-time"] = await promptForRequiredField(
						"event-end-time",
						"An ISO 8601 timestamp that marks the end of the event."
					);
				}
				if (argv["event-start-time"] === undefined) {
					argv["event-start-time"] = await promptForRequiredField(
						"event-start-time",
						"An ISO 8601 timestamp that marks the start of the event. At this time, queued users will be processed with the event's configuration. The start time must be at least one minute before \`event_end_time\`."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"A unique name to identify the event. Only alphanumeric characters, hyphens and underscores are allowed."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf waiting-rooms events update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/${argv["waiting-room-id"] == null ? "<waiting-room-id>" : encodeURIComponent(String(argv["waiting-room-id"]))}/events/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}`,
					pathParams: {
						"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						"waiting-room-id": String(argv["waiting-room-id"] ?? ""),
						"event-id": String(argv["event-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									custom_page_html: resolveFileToken(
										argv["custom-page-html"] as string | undefined,
										"custom-page-html",
										"text"
									),
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									disable_session_renewal: argv["disable-session-renewal"],
									event_end_time: resolveFileToken(
										argv["event-end-time"] as string | undefined,
										"event-end-time",
										"text"
									),
									event_start_time: resolveFileToken(
										argv["event-start-time"] as string | undefined,
										"event-start-time",
										"text"
									),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									new_users_per_minute: argv["new-users-per-minute"],
									prequeue_start_time: resolveFileToken(
										argv["prequeue-start-time"] as string | undefined,
										"prequeue-start-time",
										"text"
									),
									queueing_method: resolveFileToken(
										argv["queueing-method"] as string | undefined,
										"queueing-method",
										"text"
									),
									session_duration: argv["session-duration"],
									shuffle_at_event_start: argv["shuffle-at-event-start"],
									suspended: argv["suspended"],
									total_active_users: argv["total-active-users"],
									turnstile_action: argv["turnstile-action"],
									turnstile_mode: argv["turnstile-mode"],
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

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						waiting_room_id: argv["waiting-room-id"],
						event_id: argv["event-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				custom_page_html: resolveFileToken(
					argv["custom-page-html"] as string | undefined,
					"custom-page-html",
					"text"
				),
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				disable_session_renewal: argv["disable-session-renewal"],
				event_end_time: resolveFileToken(
					argv["event-end-time"] as string | undefined,
					"event-end-time",
					"text"
				),
				event_start_time: resolveFileToken(
					argv["event-start-time"] as string | undefined,
					"event-start-time",
					"text"
				),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				new_users_per_minute: argv["new-users-per-minute"],
				prequeue_start_time: resolveFileToken(
					argv["prequeue-start-time"] as string | undefined,
					"prequeue-start-time",
					"text"
				),
				queueing_method: resolveFileToken(
					argv["queueing-method"] as string | undefined,
					"queueing-method",
					"text"
				),
				session_duration: argv["session-duration"],
				shuffle_at_event_start: argv["shuffle-at-event-start"],
				suspended: argv["suspended"],
				total_active_users: argv["total-active-users"],
				turnstile_action: argv["turnstile-action"],
				turnstile_mode: argv["turnstile-mode"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					zone_id: zoneId,
					waiting_room_id: argv["waiting-room-id"],
					event_id: argv["event-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
