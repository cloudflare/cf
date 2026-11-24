/**
 * list command
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
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List additional audio tracks on a video",
	usage:
		"$0 stream videos audio-tracks list\n\nLists additional audio tracks on a video. Note this API will not return information for audio attached to the video upload.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
