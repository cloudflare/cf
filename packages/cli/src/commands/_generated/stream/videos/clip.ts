/**
 * clip command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"allowed-origins": {
			kind: "parsed",
			brief:
				"Lists the origins allowed to display the video. Enter allowed origin domains in an array and use `*` for wildcard subdomains. Empty arrays allow the video to be viewed on any origin.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"clipped-from-video-uid": {
			kind: "parsed",
			brief: "The unique video identifier (UID).",
			optional: true,
			parse: String,
		},
		creator: {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		"end-time-seconds": {
			kind: "parsed",
			brief: "Specifies the end time for the video clip in seconds.",
			optional: true,
			parse: Number,
		},
		input: {
			kind: "parsed",
			brief: "A video's URL. Preferred over 'url'.",
			optional: true,
			parse: String,
		},
		meta: {
			kind: "parsed",
			brief:
				'A user modifiable key-value store used to reference other systems of record for managing videos. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A name for the video.",
			optional: true,
			parse: String,
		},
		"require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates whether the video can be a accessed using the UID. When set to `true`, a signed token must be generated with a signing key to view the video.",
			default: false,
		},
		"scheduled-deletion": {
			kind: "parsed",
			brief:
				"Indicates the date and time at which the video will be deleted. Omit the field to indicate no change, or include with a `null` value to remove an existing scheduled deletion. If specified, must be at least 30 days from upload time.",
			optional: true,
			parse: String,
		},
		"start-time-seconds": {
			kind: "parsed",
			brief: "Specifies the start time for the video clip in seconds.",
			optional: true,
			parse: Number,
		},
		"thumbnail-timestamp-pct": {
			kind: "parsed",
			brief:
				"The timestamp for a thumbnail image calculated as a percentage value of the video's duration. To convert from a second-wise timestamp to a percentage, divide the desired timestamp by the total duration of the video.  If this value is not set, the default thumbnail image is taken from 0s of the video.",
			default: "0",
			parse: Number,
		},
		url: {
			kind: "parsed",
			brief: "A video's URL (legacy field, use 'input' instead).",
			optional: true,
			parse: String,
		},
		"watermark-uid": {
			kind: "parsed",
			brief: "The unique identifier for the watermark profile.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "clip",
	describe: "Clip videos given a start and end time",
	usage:
		"$0 stream videos clip\n\nClips a video based on the specified start and end times provided in seconds.",
	...parameters,
	loader: () => import("./clip.handler.js"),
});

export default command;
