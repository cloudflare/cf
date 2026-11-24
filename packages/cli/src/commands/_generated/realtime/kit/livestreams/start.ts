/**
 * start command
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
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"video-config-height": {
			kind: "parsed",
			brief: "Height of the livestreaming video in pixels",
			optional: true,
			parse: Number,
		},
		"video-config-width": {
			kind: "parsed",
			brief: "Width of the livestreaming video in pixels",
			optional: true,
			parse: Number,
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
	operands: [
		{ placeholder: "meeting-id", brief: "ID of the meeting", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "start <meeting-id>",
	describe: "Start livestreaming a meeting",
	usage:
		"$0 realtime kit livestreams start <meeting-id>\n\nStarts livestream of a meeting associated with the given meeting ID. Retreive the meeting ID using the `Create a meeting` API.",
	...parameters,
	loader: () => import("./start.handler.js"),
});

export default command;
