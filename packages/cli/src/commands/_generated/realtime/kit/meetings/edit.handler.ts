import operation from "../../../_operations/realtime/kit/meetings/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "realtime kit meetings edit",
			classification: {
				safeFlags: [
					"ai-config-summarization-summary-type",
					"ai-config-summarization-text-format",
					"ai-config-transcription-language",
					"ai-config-transcription-profanity-filter",
					"enable-sip",
					"live-stream-on-start",
					"persist-chat",
					"record-on-start",
					"recording-config-audio-config-channel",
					"recording-config-audio-config-codec",
					"recording-config-audio-config-export-file",
					"recording-config-realtimekit-bucket-config-enabled",
					"recording-config-storage-config-type",
					"recording-config-video-config-codec",
					"recording-config-video-config-export-file",
					"recording-config-video-config-watermark-position",
					"status",
					"summarize-on-end",
					"transcribe-on-end",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf realtime kit meetings edit",
					method: "PATCH",
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
											summary_type:
												argv["ai-config-summarization-summary-type"],
											text_format: argv["ai-config-summarization-text-format"],
											word_limit: argv["ai-config-summarization-word-limit"],
										},
										transcription: {
											keywords: argv["ai-config-transcription-keywords"],
											language: argv["ai-config-transcription-language"],
											profanity_filter:
												argv["ai-config-transcription-profanity-filter"],
										},
									},
									enable_sip: argv["enable-sip"],
									live_stream_on_start: argv["live-stream-on-start"],
									persist_chat: argv["persist-chat"],
									record_on_start: argv["record-on-start"],
									recording_config: {
										audio_config: {
											channel: argv["recording-config-audio-config-channel"],
											codec: argv["recording-config-audio-config-codec"],
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
										storage_config: {
											type: argv["recording-config-storage-config-type"],
										},
										video_config: {
											codec: argv["recording-config-video-config-codec"],
											export_file:
												argv["recording-config-video-config-export-file"],
											height: argv["recording-config-video-config-height"],
											watermark: {
												position:
													argv[
														"recording-config-video-config-watermark-position"
													],
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
									status: argv["status"],
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
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
						meeting_id: argv["meeting-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				ai_config: {
					summarization: {
						summary_type: argv["ai-config-summarization-summary-type"],
						text_format: argv["ai-config-summarization-text-format"],
						word_limit: argv["ai-config-summarization-word-limit"],
					},
					transcription: {
						keywords: argv["ai-config-transcription-keywords"],
						language: argv["ai-config-transcription-language"],
						profanity_filter: argv["ai-config-transcription-profanity-filter"],
					},
				},
				enable_sip: argv["enable-sip"],
				live_stream_on_start: argv["live-stream-on-start"],
				persist_chat: argv["persist-chat"],
				record_on_start: argv["record-on-start"],
				recording_config: {
					audio_config: {
						channel: argv["recording-config-audio-config-channel"],
						codec: argv["recording-config-audio-config-codec"],
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
						enabled: argv["recording-config-realtimekit-bucket-config-enabled"],
					},
					storage_config: {
						type: argv["recording-config-storage-config-type"],
					},
					video_config: {
						codec: argv["recording-config-video-config-codec"],
						export_file: argv["recording-config-video-config-export-file"],
						height: argv["recording-config-video-config-height"],
						watermark: {
							position:
								argv["recording-config-video-config-watermark-position"],
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
				status: argv["status"],
				summarize_on_end: argv["summarize-on-end"],
				title: resolveFileToken(
					argv["title"] as string | undefined,
					"title",
					"text"
				),
				transcribe_on_end: argv["transcribe-on-end"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					app_id: argv["app-id"],
					meeting_id: argv["meeting-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
