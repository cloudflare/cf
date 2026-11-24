/**
 * start command
 * @generated from apis/overlays/realtime.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"allow-multiple-recordings": {
			kind: "boolean",
			brief:
				"By default, a meeting allows only one recording to run at a time. Enabling the `allow_multiple_recordings` parameter to true allows you to initiate multiple recordings concurrently in the same meeting. This allows you to record separate videos of the same meeting with different configurations, such as portrait mode or landscape mode.",
			default: false,
		},
		"audio-config-channel": {
			kind: "parsed",
			brief:
				"Audio signal pathway within an audio file that carries a specific sound source.",
			optional: true,
			choices: ["mono", "stereo"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "audio-config-channel", "text"),
		},
		"audio-config-codec": {
			kind: "parsed",
			brief:
				"Codec using which the recording will be encoded. If VP8/VP9 is selected for videoConfig, changing audioConfig is not allowed. In this case, the codec in the audioConfig is automatically set to vorbis.",
			optional: true,
			choices: ["MP3", "AAC"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "audio-config-codec", "text"),
		},
		"audio-config-export-file": {
			kind: "boolean",
			brief: "Controls whether to export audio file seperately",
			optional: true,
		},
		"file-name-prefix": {
			kind: "parsed",
			brief: "Update the recording file name.",
			optional: true,
			parse: String,
		},
		"interactive-config-type": {
			kind: "parsed",
			brief: "The metadata is presented in the form of ID3 tags.",
			optional: true,
			choices: ["ID3"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "interactive-config-type", "text"),
		},
		"max-seconds": {
			kind: "parsed",
			brief:
				"Specifies the maximum duration for recording in seconds, ranging from a minimum of 60 seconds to a maximum of 24 hours.",
			optional: true,
			parse: Number,
		},
		"meeting-id": {
			kind: "parsed",
			brief: "ID of the meeting to record.",
			optional: true,
			parse: String,
		},
		"realtimekit-bucket-config-enabled": {
			kind: "boolean",
			brief:
				"Controls whether recordings are uploaded to RealtimeKit's bucket. If set to false, `download_url`, `audio_download_url`, `download_url_expiry` won't be generated for a recording.",
			optional: true,
		},
		"rtmp-out-config-rtmp-url": {
			kind: "parsed",
			brief: "RTMP URL to stream to",
			optional: true,
			parse: String,
		},
		"storage-config-type": {
			kind: "parsed",
			brief: "The storage_config.type field",
			optional: true,
			choices: ["gcs", "aws", "azure", "digitalocean", "sftp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "storage-config-type", "text"),
		},
		url: {
			kind: "parsed",
			brief: "Pass a custom url to record arbitary screen",
			optional: true,
			parse: String,
		},
		"video-config-codec": {
			kind: "parsed",
			brief: "Codec using which the recording will be encoded.",
			optional: true,
			choices: ["H264", "VP8", "VP9"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "video-config-codec", "text"),
		},
		"video-config-export-file": {
			kind: "boolean",
			brief: "Controls whether to export video file seperately",
			optional: true,
		},
		"video-config-height": {
			kind: "parsed",
			brief: "Height of the recording video in pixels",
			optional: true,
			parse: Number,
		},
		"video-config-watermark-position": {
			kind: "parsed",
			brief: "Position of the watermark",
			optional: true,
			choices: ["left top", "right top", "left bottom", "right bottom"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "video-config-watermark-position", "text"),
		},
		"video-config-watermark-size-height": {
			kind: "parsed",
			brief: "Height of the watermark in px",
			optional: true,
			parse: Number,
		},
		"video-config-watermark-size-width": {
			kind: "parsed",
			brief: "Width of the watermark in px",
			optional: true,
			parse: Number,
		},
		"video-config-watermark-url": {
			kind: "parsed",
			brief: "URL of the watermark image",
			optional: true,
			parse: String,
		},
		"video-config-width": {
			kind: "parsed",
			brief: "Width of the recording video in pixels",
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
		{ placeholder: "app-id", brief: "The app identifier tag.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "start <app-id>",
	describe: "Start recording a meeting",
	usage:
		"$0 realtime kit recordings start <app-id>\n\nStarts recording a meeting. The meeting can be started by an App admin directly, or a participant with permissions to start a recording, based on the type of authorization used.",
	...parameters,
	loader: () => import("./start.handler.js"),
});

export default command;
