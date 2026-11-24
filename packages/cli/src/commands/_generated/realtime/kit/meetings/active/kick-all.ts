/**
 * kick-all command
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
	operands: [
		{ placeholder: "meeting-id", brief: "ID of the meeting", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "kick-all <meeting-id>",
	describe: "Kick all participants",
	usage:
		"$0 realtime kit meetings active kick-all <meeting-id>\n\nKicks all participants from an active session for the given meeting ID and ends the session. Participants in connected breakout rooms are kicked as well.",
	...parameters,
	loader: () => import("./kick-all.handler.js"),
});

export default command;
