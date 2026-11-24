/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "event-id", brief: "Event ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <event-id>",
	describe: "Delete event",
	usage:
		"$0 waiting-rooms events delete <event-id>\n\nDeletes an event for a waiting room.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
