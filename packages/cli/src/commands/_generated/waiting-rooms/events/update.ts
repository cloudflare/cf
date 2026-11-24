/**
 * update command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"waiting-room-id": {
			kind: "parsed",
			brief: "Waiting room ID",
			parse: String,
		},
		"custom-page-html": {
			kind: "parsed",
			brief:
				"If set, the event will override the waiting room's `custom_page_html` property while it is active. If null, the event will inherit it.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "A note that you can use to add more details about the event.",
			optional: true,
			parse: String,
		},
		"disable-session-renewal": {
			kind: "boolean",
			brief:
				"If set, the event will override the waiting room's `disable_session_renewal` property while it is active. If null, the event will inherit it.",
			optional: true,
		},
		"event-end-time": {
			kind: "parsed",
			brief: "An ISO 8601 timestamp that marks the end of the event.",
			optional: true,
			parse: String,
		},
		"event-start-time": {
			kind: "parsed",
			brief:
				"An ISO 8601 timestamp that marks the start of the event. At this time, queued users will be processed with the event's configuration. The start time must be at least one minute before `event_end_time`.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"A unique name to identify the event. Only alphanumeric characters, hyphens and underscores are allowed.",
			optional: true,
			parse: String,
		},
		"new-users-per-minute": {
			kind: "parsed",
			brief:
				"If set, the event will override the waiting room's `new_users_per_minute` property while it is active. If null, the event will inherit it. This can only be set if the event's `total_active_users` property is also set.",
			optional: true,
			parse: Number,
		},
		"prequeue-start-time": {
			kind: "parsed",
			brief:
				"An ISO 8601 timestamp that marks when to begin queueing all users before the event starts. The prequeue must start at least five minutes before `event_start_time`.",
			optional: true,
			parse: String,
		},
		"queueing-method": {
			kind: "parsed",
			brief:
				"If set, the event will override the waiting room's `queueing_method` property while it is active. If null, the event will inherit it.",
			optional: true,
			parse: String,
		},
		"session-duration": {
			kind: "parsed",
			brief:
				"If set, the event will override the waiting room's `session_duration` property while it is active. If null, the event will inherit it.",
			optional: true,
			parse: Number,
		},
		"shuffle-at-event-start": {
			kind: "boolean",
			brief:
				"If enabled, users in the prequeue will be shuffled randomly at the `event_start_time`. Requires that `prequeue_start_time` is not null. This is useful for situations when many users will join the event prequeue at the same time and you want to shuffle them to ensure fairness. Naturally, it makes the most sense to enable this feature when the `queueing_method` during the event respects ordering such as **fifo**, or else the shuffling may be unnecessary.",
			optional: true,
		},
		suspended: {
			kind: "boolean",
			brief:
				"Suspends or allows an event. If set to `true`, the event is ignored and traffic will be handled based on the waiting room configuration.",
			optional: true,
		},
		"total-active-users": {
			kind: "parsed",
			brief:
				"If set, the event will override the waiting room's `total_active_users` property while it is active. If null, the event will inherit it. This can only be set if the event's `new_users_per_minute` property is also set.",
			optional: true,
			parse: Number,
		},
		"turnstile-action": {
			kind: "parsed",
			brief:
				"If set, the event will override the waiting room's `turnstile_action` property while it is active. If null, the event will inherit it.",
			optional: true,
			choices: ["log", "infinite_queue"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "turnstile-action", "text"),
		},
		"turnstile-mode": {
			kind: "parsed",
			brief:
				"If set, the event will override the waiting room's `turnstile_mode` property while it is active. If null, the event will inherit it.",
			optional: true,
			choices: [
				"off",
				"invisible",
				"visible_non_interactive",
				"visible_managed",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "turnstile-mode", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "event-id", brief: "Event ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <event-id>",
	describe: "Update event",
	usage:
		"$0 waiting-rooms events update <event-id>\n\nUpdates a configured event for a waiting room.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
