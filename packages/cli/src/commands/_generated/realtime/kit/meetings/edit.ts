/**
 * edit command
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
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"ai-config-summarization-summary-type": {
			kind: "parsed",
			brief:
				"Defines the style of the summary, such as general, team meeting, or sales call.",
			optional: true,
			choices: [
				"general",
				"team_meeting",
				"sales_call",
				"client_check_in",
				"interview",
				"daily_standup",
				"one_on_one_meeting",
				"lecture",
				"code_review",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-config-summarization-summary-type", "text"),
		},
		"ai-config-summarization-text-format": {
			kind: "parsed",
			brief:
				"Determines the text format of the summary, such as plain text or markdown.",
			optional: true,
			choices: ["plain_text", "markdown"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-config-summarization-text-format", "text"),
		},
		"ai-config-summarization-word-limit": {
			kind: "parsed",
			brief: "Sets the maximum number of words in the meeting summary.",
			optional: true,
			parse: Number,
		},
		"ai-config-transcription-keywords": {
			kind: "parsed",
			brief:
				"Adds specific terms to improve accurate detection during transcription.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ai-config-transcription-language": {
			kind: "parsed",
			brief:
				"Specifies the language code for transcription to ensure accurate results. If omitted, the language is auto-detected for post-meeting (Whisper) transcription.",
			optional: true,
			choices: [
				"en-US",
				"en-IN",
				"de",
				"hi",
				"sv",
				"ru",
				"pl",
				"el",
				"fr",
				"nl",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ai-config-transcription-language", "text"),
		},
		"ai-config-transcription-profanity-filter": {
			kind: "boolean",
			brief: "Control the inclusion of offensive language in transcriptions.",
			optional: true,
		},
		"enable-sip": {
			kind: "boolean",
			brief:
				"Turns SIP dial-in on or off. Turning it off deletes the SIP URI and credentials; calls already in progress continue. Turning it on again creates a new SIP URI and credentials.",
			optional: true,
		},
		"live-stream-on-start": {
			kind: "boolean",
			brief:
				"Specifies if the meeting should start getting livestreamed on start.",
			optional: true,
		},
		"persist-chat": {
			kind: "boolean",
			brief:
				"If a meeting is updated to persist_chat, meeting chat would remain for a week within the meeting space.",
			optional: true,
		},
		"record-on-start": {
			kind: "boolean",
			brief:
				"Specifies if the meeting should start getting recorded as soon as someone joins the meeting.",
			optional: true,
		},
		"recording-config-audio-config-channel": {
			kind: "parsed",
			brief:
				"Audio signal pathway within an audio file that carries a specific sound source.",
			optional: true,
			choices: ["mono", "stereo"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"recording-config-audio-config-channel",
					"text"
				),
		},
		"recording-config-audio-config-codec": {
			kind: "parsed",
			brief:
				"Codec using which the recording will be encoded. If VP8/VP9 is selected for videoConfig, changing audioConfig is not allowed. In this case, the codec in the audioConfig is automatically set to vorbis.",
			optional: true,
			choices: ["MP3", "AAC"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "recording-config-audio-config-codec", "text"),
		},
		"recording-config-audio-config-export-file": {
			kind: "boolean",
			brief: "Controls whether to export audio file seperately",
			optional: true,
		},
		"recording-config-file-name-prefix": {
			kind: "parsed",
			brief:
				"Adds a prefix to the beginning of the file name of the recording.",
			optional: true,
			parse: String,
		},
		"recording-config-live-streaming-config-rtmp-url": {
			kind: "parsed",
			brief: "RTMP URL to stream to",
			optional: true,
			parse: String,
		},
		"recording-config-max-seconds": {
			kind: "parsed",
			brief:
				"Specifies the maximum duration for recording in seconds, ranging from a minimum of 60 seconds to a maximum of 24 hours.",
			optional: true,
			parse: Number,
		},
		"recording-config-realtimekit-bucket-config-enabled": {
			kind: "boolean",
			brief:
				"Controls whether recordings are uploaded to RealtimeKit's bucket. If set to false, `download_url`, `audio_download_url`, `download_url_expiry` won't be generated for a recording.",
			optional: true,
		},
		"recording-config-storage-config-type": {
			kind: "parsed",
			brief: "The recording_config.storage_config.type field",
			optional: true,
			choices: ["gcs", "aws", "azure", "digitalocean", "sftp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "recording-config-storage-config-type", "text"),
		},
		"recording-config-video-config-codec": {
			kind: "parsed",
			brief: "Codec using which the recording will be encoded.",
			optional: true,
			choices: ["H264", "VP8", "VP9"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "recording-config-video-config-codec", "text"),
		},
		"recording-config-video-config-export-file": {
			kind: "boolean",
			brief: "Controls whether to export video file seperately",
			optional: true,
		},
		"recording-config-video-config-height": {
			kind: "parsed",
			brief: "Height of the recording video in pixels",
			optional: true,
			parse: Number,
		},
		"recording-config-video-config-watermark-position": {
			kind: "parsed",
			brief: "Position of the watermark",
			optional: true,
			choices: ["left top", "right top", "left bottom", "right bottom"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"recording-config-video-config-watermark-position",
					"text"
				),
		},
		"recording-config-video-config-watermark-url": {
			kind: "parsed",
			brief: "URL of the watermark image",
			optional: true,
			parse: String,
		},
		"recording-config-video-config-width": {
			kind: "parsed",
			brief: "Width of the recording video in pixels",
			optional: true,
			parse: Number,
		},
		"session-keep-alive-time-in-secs": {
			kind: "parsed",
			brief:
				"Time in seconds, for which a session remains active, after the last participant has left the meeting.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "parsed",
			brief:
				"Whether the meeting is `ACTIVE` or `INACTIVE`. Users will not be able to join an `INACTIVE` meeting.",
			optional: true,
			choices: ["ACTIVE", "INACTIVE"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "status", "text"),
		},
		"summarize-on-end": {
			kind: "boolean",
			brief:
				"Automatically generate summary of meetings using transcripts. Requires Transcriptions to be enabled, and can be retrieved via Webhooks or summary API.",
			optional: true,
		},
		title: {
			kind: "parsed",
			brief: "Title of the meeting",
			optional: true,
			parse: String,
		},
		"transcribe-on-end": {
			kind: "boolean",
			brief: "Automatically generate transcripts when the meeting ends.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Update meeting body",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "meeting-id",
			brief:
				"ID of the meeting. Fetch the meeting ID using the create a meeting API.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <meeting-id>",
	describe: "Update a meeting",
	usage:
		"$0 realtime kit meetings edit <meeting-id>\n\nUpdates a meeting in an App for the given meeting ID.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
