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
		"max-duration-seconds": {
			kind: "parsed",
			brief:
				"The maximum duration in seconds for a video upload. Can be set for a video that is not yet uploaded to limit its duration. Uploads that exceed the specified duration will fail during processing. A value of `-1` means the value is unknown.",
			optional: true,
			parse: Number,
		},
		meta: {
			kind: "parsed",
			brief:
				'A user modifiable key-value store used to reference other systems of record for managing videos. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"public-details-channel-link": {
			kind: "parsed",
			brief: "The publicDetails.channel_link field",
			optional: true,
			parse: String,
		},
		"public-details-logo": {
			kind: "parsed",
			brief: "The publicDetails.logo field",
			optional: true,
			parse: String,
		},
		"public-details-share-link": {
			kind: "parsed",
			brief: "The publicDetails.share_link field",
			optional: true,
			parse: String,
		},
		"public-details-title": {
			kind: "parsed",
			brief: "The publicDetails.title field",
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
		uid: {
			kind: "parsed",
			brief:
				"The unique identifier for the video. Can be used to verify the video being updated.",
			optional: true,
			parse: String,
		},
		"upload-expiry": {
			kind: "parsed",
			brief:
				"The date and time when the video upload URL is no longer valid for direct user uploads.",
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
	command: "edit <identifier>",
	describe: "Edit video details",
	usage:
		"$0 stream videos edit <identifier>\n\nEdit details for a single video.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
