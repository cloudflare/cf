/**
 * copy command
 * @generated from apis/overlays/stream.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"upload-creator": {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		"allowed-origins": {
			kind: "parsed",
			brief:
				"Lists the origins allowed to display the video. Enter allowed origin domains in an array and use `*` for wildcard subdomains. Empty arrays allow the video to be viewed on any origin.",
			variadic: true,
			optional: true,
			parse: String,
		},
		creator: {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		"encoding-mode": {
			kind: "parsed",
			brief:
				"Specifies whether to generate a preview rendition before the standard encoding ladder. `default` generates only the standard encoding ladder. `previewFirst` generates a preview rendition first.",
			default: "default",
			choices: ["default", "previewFirst"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "encoding-mode", "text"),
		},
		input: {
			kind: "parsed",
			brief:
				"A video's URL. The server must be publicly routable and support `HTTP HEAD` requests and `HTTP GET` range requests. The server should respond to `HTTP HEAD` requests with a `content-range` header that includes the size of the file. This is the preferred field over `url`.",
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
			brief: "A video's name. Used for legacy compatibility.",
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
		"thumbnail-timestamp-pct": {
			kind: "parsed",
			brief:
				"The timestamp for a thumbnail image calculated as a percentage value of the video's duration. To convert from a second-wise timestamp to a percentage, divide the desired timestamp by the total duration of the video.  If this value is not set, the default thumbnail image is taken from 0s of the video.",
			default: "0",
			parse: Number,
		},
		url: {
			kind: "parsed",
			brief:
				"A video's URL. The server must be publicly routable and support `HTTP HEAD` requests and `HTTP GET` range requests. The server should respond to `HTTP HEAD` requests with a `content-range` header that includes the size of the file. This field is deprecated in favor of `input`.",
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
			brief:
				"Copy upload request. Provide `input` (preferred) or `url` (deprecated).",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "copy",
	describe: "Upload videos from a URL",
	usage:
		"$0 stream videos copy\n\nUploads a video to Stream from a provided URL.",
	...parameters,
	loader: () => import("./copy.handler.js"),
});

export default command;
