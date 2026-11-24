/**
 * edit command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		identifier: {
			kind: "parsed",
			brief: "A Cloudflare-generated unique identifier for a media item.",
			parse: String,
		},
		default: {
			kind: "boolean",
			brief:
				"Denotes whether the audio track will be played by default in a player.",
			optional: true,
		},
		label: {
			kind: "parsed",
			brief:
				"A string to uniquely identify the track amongst other audio track labels for the specified video.",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "audio-identifier",
			brief: "The unique identifier for an additional audio track.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <audio-identifier>",
	describe: "Edit additional audio tracks on a video",
	usage:
		"$0 stream videos audio-tracks edit <audio-identifier>\n\nEdits additional audio tracks on a video. Editing the default status of an audio track to `true` will mark all other audio tracks on the video default status to `false`.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
