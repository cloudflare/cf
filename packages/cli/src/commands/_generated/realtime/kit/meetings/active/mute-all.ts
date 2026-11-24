/**
 * mute-all command
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
		"allow-unmute": {
			kind: "boolean",
			brief:
				"This field is ignored. Muted participants can unmute themselves if their preset allows them to produce audio.",
			default: false,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for muting all participants in an active session.",
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
	command: "mute-all <meeting-id>",
	describe: "Mute all participants",
	usage:
		"$0 realtime kit meetings active mute-all <meeting-id>\n\nMutes the microphone of all participants of an active session for the given meeting ID.",
	...parameters,
	loader: () => import("./mute-all.handler.js"),
});

export default command;
