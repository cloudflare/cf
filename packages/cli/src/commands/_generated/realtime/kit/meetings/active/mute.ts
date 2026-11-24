/**
 * mute command
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
				"IDs of the participants to mute, as returned when the participants were added to the meeting.",
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
			brief: "Request body for muting participants in an active session.",
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
	command: "mute <meeting-id>",
	describe: "Mute participants of an active session",
	usage:
		"$0 realtime kit meetings active mute <meeting-id>\n\nMutes the microphone of one or more participants of an active session using their participant IDs.",
	...parameters,
	loader: () => import("./mute.handler.js"),
});

export default command;
