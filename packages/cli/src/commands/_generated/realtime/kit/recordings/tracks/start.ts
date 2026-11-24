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
		layers: {
			kind: "parsed",
			brief:
				'Optional audio layer configuration. If omitted, RealtimeKit records all participant audio using the default file name prefix. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"meeting-id": {
			kind: "parsed",
			brief: "ID of the meeting to record.",
			optional: true,
			parse: String,
		},
		"user-ids": {
			kind: "parsed",
			brief:
				"Optional list of participant user IDs to record. Selective track recording (`user_ids`) is in early beta contact support to use this feature.",
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
			brief:
				"Starts audio track recording for an active meeting. Use `layers` only when you need to set a file name prefix. Selective track recording (`user_ids`) is in early beta contact support to use this feature.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "app-id", brief: "The app identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "start <app-id>",
	describe: "Start recording participant audio tracks",
	usage:
		"$0 realtime kit recordings tracks start <app-id>\n\nStarts track recording for a meeting. Track recording currently records separate participant audio tracks as WebM files in the RealtimeKit bucket. Video track recording is in development. For more information, refer to [Track recording](/realtime/realtimekit/recording-guide/track-recording/).",
	...parameters,
	loader: () => import("./start.handler.js"),
});

export default command;
