import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * replace command
 * @generated from apis/overlays/realtime.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit meetings replace <meeting-id>\n\nReplaces all the details for the given meeting ID."
		)
		.positional("meeting-id", {
			type: "string",
			description:
				"ID of the meeting. Fetch the meeting ID using the create a meeting API.",
			demandOption: true,
		})
		.option("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("ai-config-summarization-summary-type", {
			type: "string",
			description:
				"Defines the style of the summary, such as general, team meeting, or sales call.",
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
		})
		.option("ai-config-summarization-text-format", {
			type: "string",
			description:
				"Determines the text format of the summary, such as plain text or markdown.",
			choices: ["plain_text", "markdown"],
		})
		.option("ai-config-summarization-word-limit", {
			type: "number",
			description: "Sets the maximum number of words in the meeting summary.",
		})
		.option("ai-config-transcription-keywords", {
			type: "string",
			array: true,
			description:
				"Adds specific terms to improve accurate detection during transcription.",
		})
		.option("ai-config-transcription-language", {
			type: "string",
			description:
				"Specifies the language code for transcription to ensure accurate results.",
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
		})
		.option("ai-config-transcription-profanity-filter", {
			type: "boolean",
			description:
				"Control the inclusion of offensive language in transcriptions.",
		})
		.option("live-stream-on-start", {
			type: "boolean",
			description:
				"Specifies if the meeting should start getting livestreamed on start.",
		})
		.option("persist-chat", {
			type: "boolean",
			description:
				"If a meeting is set to persist_chat, meeting chat would remain for a week within the meeting space.",
		})
		.option("record-on-start", {
			type: "boolean",
			description:
				"Specifies if the meeting should start getting recorded as soon as someone joins the meeting.",
		})
		.option("recording-config-audio-config-channel", {
			type: "string",
			description:
				"Audio signal pathway within an audio file that carries a specific sound source.",
			choices: ["mono", "stereo"],
		})
		.option("recording-config-audio-config-codec", {
			type: "string",
			description:
				"Codec using which the recording will be encoded. If VP8/VP9 is selected for videoConfig, changing audioConfig is not allowed. In this case, the codec in the audioConfig is automatically set to vorbis.",
			choices: ["MP3", "AAC"],
		})
		.option("recording-config-audio-config-export-file", {
			type: "boolean",
			description: "Controls whether to export audio file seperately",
		})
		.option("recording-config-file-name-prefix", {
			type: "string",
			description:
				"Adds a prefix to the beginning of the file name of the recording.",
		})
		.option("recording-config-live-streaming-config-rtmp-url", {
			type: "string",
			description: "RTMP URL to stream to",
		})
		.option("recording-config-max-seconds", {
			type: "number",
			description:
				"Specifies the maximum duration for recording in seconds, ranging from a minimum of 60 seconds to a maximum of 24 hours.",
		})
		.option("recording-config-realtimekit-bucket-config-enabled", {
			type: "boolean",
			description:
				"Controls whether recordings are uploaded to RealtimeKit's bucket. If set to false, `download_url`, `audio_download_url`, `download_url_expiry` won't be generated for a recording.",
		})
		.option("recording-config-video-config-codec", {
			type: "string",
			description: "Codec using which the recording will be encoded.",
			choices: ["H264", "VP8", "VP9"],
		})
		.option("recording-config-video-config-export-file", {
			type: "boolean",
			description: "Controls whether to export video file seperately",
		})
		.option("recording-config-video-config-height", {
			type: "number",
			description: "Height of the recording video in pixels",
		})
		.option("recording-config-video-config-watermark-position", {
			type: "string",
			description: "Position of the watermark",
			choices: ["left top", "right top", "left bottom", "right bottom"],
		})
		.option("recording-config-video-config-watermark-url", {
			type: "string",
			description: "URL of the watermark image",
		})
		.option("recording-config-video-config-width", {
			type: "number",
			description: "Width of the recording video in pixels",
		})
		.option("session-keep-alive-time-in-secs", {
			type: "number",
			description:
				"Time in seconds, for which a session remains active, after the last participant has left the meeting.",
		})
		.option("summarize-on-end", {
			type: "boolean",
			description:
				"Automatically generate summary of meetings using transcripts. Requires Transcriptions to be enabled, and can be retrieved via Webhooks or summary API.",
		})
		.option("title", { type: "string", description: "Title of the meeting" })
		.option("transcribe-on-end", {
			type: "boolean",
			description: "Automatically generate transcripts when the meeting ends.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Create meeting body",
		})
		.check((argv) => {
			const groupSet = [
				"recording-config-audio-config-channel",
				"recording-config-audio-config-codec",
				"recording-config-audio-config-export-file",
				"recording-config-file-name-prefix",
				"recording-config-live-streaming-config-rtmp-url",
				"recording-config-max-seconds",
				"recording-config-realtimekit-bucket-config-enabled",
				"recording-config-video-config-codec",
				"recording-config-video-config-export-file",
				"recording-config-video-config-height",
				"recording-config-video-config-watermark-position",
				"recording-config-video-config-watermark-url",
				"recording-config-video-config-width",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"recording-config-realtimekit-bucket-config-enabled",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --recording_config-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"replace_meeting">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "replace <meeting-id>",
	describe: "Replace a meeting",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit meetings replace",
				classification: {
					safeFlags: [
						"ai-config-summarization-summary-type",
						"ai-config-summarization-text-format",
						"ai-config-transcription-language",
						"ai-config-transcription-profanity-filter",
						"live-stream-on-start",
						"persist-chat",
						"record-on-start",
						"recording-config-audio-config-channel",
						"recording-config-audio-config-codec",
						"recording-config-audio-config-export-file",
						"recording-config-realtimekit-bucket-config-enabled",
						"recording-config-video-config-codec",
						"recording-config-video-config-export-file",
						"recording-config-video-config-watermark-position",
						"summarize-on-end",
						"transcribe-on-end",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit meetings replace",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/meetings/${argv["meeting-id"] == null ? "<meeting-id>" : encodeURIComponent(String(argv["meeting-id"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"meeting-id": String(argv["meeting-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ai_config: {
											summarization: {
												summary_type: resolveFileToken(
													argv["ai-config-summarization-summary-type"] as
														| string
														| undefined,
													"ai-config-summarization-summary-type",
													"text"
												),
												text_format: resolveFileToken(
													argv["ai-config-summarization-text-format"] as
														| string
														| undefined,
													"ai-config-summarization-text-format",
													"text"
												),
												word_limit: argv["ai-config-summarization-word-limit"],
											},
											transcription: {
												keywords: argv["ai-config-transcription-keywords"],
												language: resolveFileToken(
													argv["ai-config-transcription-language"] as
														| string
														| undefined,
													"ai-config-transcription-language",
													"text"
												),
												profanity_filter:
													argv["ai-config-transcription-profanity-filter"],
											},
										},
										live_stream_on_start: argv["live-stream-on-start"],
										persist_chat: argv["persist-chat"],
										record_on_start: argv["record-on-start"],
										recording_config: {
											audio_config: {
												channel: resolveFileToken(
													argv["recording-config-audio-config-channel"] as
														| string
														| undefined,
													"recording-config-audio-config-channel",
													"text"
												),
												codec: resolveFileToken(
													argv["recording-config-audio-config-codec"] as
														| string
														| undefined,
													"recording-config-audio-config-codec",
													"text"
												),
												export_file:
													argv["recording-config-audio-config-export-file"],
											},
											file_name_prefix: resolveFileToken(
												argv["recording-config-file-name-prefix"] as
													| string
													| undefined,
												"recording-config-file-name-prefix",
												"text"
											),
											live_streaming_config: {
												rtmp_url: resolveFileToken(
													argv[
														"recording-config-live-streaming-config-rtmp-url"
													] as string | undefined,
													"recording-config-live-streaming-config-rtmp-url",
													"text"
												),
											},
											max_seconds: argv["recording-config-max-seconds"],
											realtimekit_bucket_config: {
												enabled:
													argv[
														"recording-config-realtimekit-bucket-config-enabled"
													],
											},
											video_config: {
												codec: resolveFileToken(
													argv["recording-config-video-config-codec"] as
														| string
														| undefined,
													"recording-config-video-config-codec",
													"text"
												),
												export_file:
													argv["recording-config-video-config-export-file"],
												height: argv["recording-config-video-config-height"],
												watermark: {
													position: resolveFileToken(
														argv[
															"recording-config-video-config-watermark-position"
														] as string | undefined,
														"recording-config-video-config-watermark-position",
														"text"
													),
													url: resolveFileToken(
														argv[
															"recording-config-video-config-watermark-url"
														] as string | undefined,
														"recording-config-video-config-watermark-url",
														"text"
													),
												},
												width: argv["recording-config-video-config-width"],
											},
										},
										session_keep_alive_time_in_secs:
											argv["session-keep-alive-time-in-secs"],
										summarize_on_end: argv["summarize-on-end"],
										title: resolveFileToken(
											argv["title"] as string | undefined,
											"title",
											"text"
										),
										transcribe_on_end: argv["transcribe-on-end"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.realtime.kit.meetings.replace({
							...bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
							meeting_id: argv["meeting-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					ai_config: {
						summarization: {
							summary_type: resolveFileToken(
								argv["ai-config-summarization-summary-type"] as
									| string
									| undefined,
								"ai-config-summarization-summary-type",
								"text"
							),
							text_format: resolveFileToken(
								argv["ai-config-summarization-text-format"] as
									| string
									| undefined,
								"ai-config-summarization-text-format",
								"text"
							),
							word_limit: argv["ai-config-summarization-word-limit"],
						},
						transcription: {
							keywords: argv["ai-config-transcription-keywords"],
							language: resolveFileToken(
								argv["ai-config-transcription-language"] as string | undefined,
								"ai-config-transcription-language",
								"text"
							),
							profanity_filter:
								argv["ai-config-transcription-profanity-filter"],
						},
					},
					live_stream_on_start: argv["live-stream-on-start"],
					persist_chat: argv["persist-chat"],
					record_on_start: argv["record-on-start"],
					recording_config: {
						audio_config: {
							channel: resolveFileToken(
								argv["recording-config-audio-config-channel"] as
									| string
									| undefined,
								"recording-config-audio-config-channel",
								"text"
							),
							codec: resolveFileToken(
								argv["recording-config-audio-config-codec"] as
									| string
									| undefined,
								"recording-config-audio-config-codec",
								"text"
							),
							export_file: argv["recording-config-audio-config-export-file"],
						},
						file_name_prefix: resolveFileToken(
							argv["recording-config-file-name-prefix"] as string | undefined,
							"recording-config-file-name-prefix",
							"text"
						),
						live_streaming_config: {
							rtmp_url: resolveFileToken(
								argv["recording-config-live-streaming-config-rtmp-url"] as
									| string
									| undefined,
								"recording-config-live-streaming-config-rtmp-url",
								"text"
							),
						},
						max_seconds: argv["recording-config-max-seconds"],
						realtimekit_bucket_config: {
							enabled:
								argv["recording-config-realtimekit-bucket-config-enabled"],
						},
						video_config: {
							codec: resolveFileToken(
								argv["recording-config-video-config-codec"] as
									| string
									| undefined,
								"recording-config-video-config-codec",
								"text"
							),
							export_file: argv["recording-config-video-config-export-file"],
							height: argv["recording-config-video-config-height"],
							watermark: {
								position: resolveFileToken(
									argv["recording-config-video-config-watermark-position"] as
										| string
										| undefined,
									"recording-config-video-config-watermark-position",
									"text"
								),
								url: resolveFileToken(
									argv["recording-config-video-config-watermark-url"] as
										| string
										| undefined,
									"recording-config-video-config-watermark-url",
									"text"
								),
							},
							width: argv["recording-config-video-config-width"],
						},
					},
					session_keep_alive_time_in_secs:
						argv["session-keep-alive-time-in-secs"],
					summarize_on_end: argv["summarize-on-end"],
					title: resolveFileToken(
						argv["title"] as string | undefined,
						"title",
						"text"
					),
					transcribe_on_end: argv["transcribe-on-end"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.realtime.kit.meetings.replace({
						...bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						meeting_id: argv["meeting-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
