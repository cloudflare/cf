import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 waiting-rooms events update <event-id>\n\nUpdates a configured event for a waiting room."
		)
		.positional("event-id", {
			type: "string",
			description: "Event ID",
			demandOption: true,
		})
		.option("waiting-room-id", {
			type: "string",
			description: "Waiting room ID",
			demandOption: true,
		})
		.option("custom-page-html", {
			type: "string",
			description:
				"If set, the event will override the waiting room's `custom_page_html` property while it is active. If null, the event will inherit it.",
		})
		.option("description", {
			type: "string",
			description:
				"A note that you can use to add more details about the event.",
		})
		.option("disable-session-renewal", {
			type: "boolean",
			description:
				"If set, the event will override the waiting room's `disable_session_renewal` property while it is active. If null, the event will inherit it.",
		})
		.option("event-end-time", {
			type: "string",
			description: "An ISO 8601 timestamp that marks the end of the event.",
		})
		.option("event-start-time", {
			type: "string",
			description:
				"An ISO 8601 timestamp that marks the start of the event. At this time, queued users will be processed with the event's configuration. The start time must be at least one minute before `event_end_time`.",
		})
		.option("name", {
			type: "string",
			description:
				"A unique name to identify the event. Only alphanumeric characters, hyphens and underscores are allowed.",
		})
		.option("new-users-per-minute", {
			type: "number",
			description:
				"If set, the event will override the waiting room's `new_users_per_minute` property while it is active. If null, the event will inherit it. This can only be set if the event's `total_active_users` property is also set.",
		})
		.option("prequeue-start-time", {
			type: "string",
			description:
				"An ISO 8601 timestamp that marks when to begin queueing all users before the event starts. The prequeue must start at least five minutes before `event_start_time`.",
		})
		.option("queueing-method", {
			type: "string",
			description:
				"If set, the event will override the waiting room's `queueing_method` property while it is active. If null, the event will inherit it.",
		})
		.option("session-duration", {
			type: "number",
			description:
				"If set, the event will override the waiting room's `session_duration` property while it is active. If null, the event will inherit it.",
		})
		.option("shuffle-at-event-start", {
			type: "boolean",
			description:
				"If enabled, users in the prequeue will be shuffled randomly at the `event_start_time`. Requires that `prequeue_start_time` is not null. This is useful for situations when many users will join the event prequeue at the same time and you want to shuffle them to ensure fairness. Naturally, it makes the most sense to enable this feature when the `queueing_method` during the event respects ordering such as **fifo**, or else the shuffling may be unnecessary.",
		})
		.option("suspended", {
			type: "boolean",
			description:
				"Suspends or allows an event. If set to `true`, the event is ignored and traffic will be handled based on the waiting room configuration.",
		})
		.option("total-active-users", {
			type: "number",
			description:
				"If set, the event will override the waiting room's `total_active_users` property while it is active. If null, the event will inherit it. This can only be set if the event's `new_users_per_minute` property is also set.",
		})
		.option("turnstile-action", {
			type: "string",
			description:
				"If set, the event will override the waiting room's `turnstile_action` property while it is active. If null, the event will inherit it.",
			choices: ["log", "infinite_queue"],
		})
		.coerce("turnstile-action", (value: string | undefined) =>
			resolveFileToken(value, "turnstile-action", "text")
		)
		.option("turnstile-mode", {
			type: "string",
			description:
				"If set, the event will override the waiting room's `turnstile_mode` property while it is active. If null, the event will inherit it.",
			choices: [
				"off",
				"invisible",
				"visible_non_interactive",
				"visible_managed",
			],
		})
		.coerce("turnstile-mode", (value: string | undefined) =>
			resolveFileToken(value, "turnstile-mode", "text")
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

type Request = SdkRequest<"waiting-room-update-event">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <event-id>",
	describe: "Update event",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf waiting-rooms events update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/${argv["waiting-room-id"] == null ? "<waiting-room-id>" : encodeURIComponent(String(argv["waiting-room-id"]))}/events/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}`,
						pathParams: {
							"event-id": String(argv["event-id"] ?? ""),
							"waiting-room-id": String(argv["waiting-room-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.waitingRooms.events.update({
							body: bodyData,
							zone_id: zoneId,
							waiting_room_id: argv["waiting-room-id"],
							event_id: argv["event-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.waitingRooms.events.update({
						body: bodyData,
						zone_id: zoneId,
						waiting_room_id: argv["waiting-room-id"],
						event_id: argv["event-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
