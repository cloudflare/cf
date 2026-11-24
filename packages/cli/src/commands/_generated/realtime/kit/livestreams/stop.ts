/**
 * stop command
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
	command: "stop <meeting-id>",
	describe: "Stop livestreaming a meeting",
	usage:
		"$0 realtime kit livestreams stop <meeting-id>\n\nStops the active livestream of a meeting associated with the given meeting ID. Retreive the meeting ID using the `Create a meeting` API.",
	...parameters,
	loader: () => import("./stop.handler.js"),
});

export default command;
