/**
 * kick command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"participant-ids": {
			kind: "parsed",
			brief:
				"IDs of the participants to kick, as returned when the participants were added to the meeting.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for kicking participants from an active session.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "meeting-id", brief: "ID of the meeting", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "kick <meeting-id>",
	describe: "Kick participants from an active session",
	usage:
		"$0 realtime kit meetings active kick <meeting-id>\n\nKicks one or more participants from an active session using their participant IDs. Every connection of each participant is removed from the session.",
	...parameters,
	loader: () => import("./kick.handler.js"),
});

export default command;
