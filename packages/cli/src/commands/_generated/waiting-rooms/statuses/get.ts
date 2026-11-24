/**
 * get command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "waiting-room-id", brief: "Waiting room ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <waiting-room-id>",
	describe: "Get waiting room status",
	usage:
		"$0 waiting-rooms statuses get <waiting-room-id>\n\nFetches the status of a configured waiting room. Response fields include: 1. `status`: String indicating the status of the waiting room. The possible status are: - **not_queueing** indicates that the configured thresholds have not been met and all users are going through to the origin. - **queueing** indicates that the thresholds have been met and some users are held in the waiting room. - **event_prequeueing** indicates that an event is active and is currently prequeueing users before it starts. - **suspended** indicates that the room is suspended. 2. `event_id`: String of the current event's `id` if an event is active, otherwise an empty string. 3. `estimated_queued_users`: Integer of the estimated number of users currently waiting in the queue. 4. `estimated_total_active_users`: Integer of the estimated number of users currently active on the origin. 5. `max_estimated_time_minutes`: Integer of the maximum estimated time currently presented to the users.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
