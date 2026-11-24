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
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <event-id>",
	describe: "Preview active event details",
	usage:
		"$0 waiting-rooms events details get <event-id>\n\nPreviews an event's configuration as if it was active. Inherited fields from the waiting room will be displayed with their current values.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
