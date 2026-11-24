/**
 * copy command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		label: {
			kind: "parsed",
			brief:
				"A string to uniquely identify the track amongst other audio track labels for the specified video.",
			optional: true,
			parse: String,
		},
		url: {
			kind: "parsed",
			brief:
				"An audio track URL. The server must be publicly routable and support `HTTP HEAD` requests and `HTTP GET` range requests. The server should respond to `HTTP HEAD` requests with a `content-range` header that includes the size of the file.",
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
			placeholder: "identifier",
			brief: "A Cloudflare-generated unique identifier for a media item.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "copy <identifier>",
	describe: "Add audio tracks to a video",
	usage:
		"$0 stream videos audio-tracks copy <identifier>\n\nAdds an additional audio track to a video using the provided audio track URL.",
	...parameters,
	loader: () => import("./copy.handler.js"),
});

export default command;
