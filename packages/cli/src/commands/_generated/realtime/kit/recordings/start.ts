import operation from "../../../_operations/realtime/kit/recordings/start.js";
/**
 * start command
 * @generated from apis/overlays/realtime.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "start <app-id>",
	describe: "Start recording a meeting",
	usage:
		"$0 realtime kit recordings start <app-id>\n\nStarts recording a meeting. The meeting can be started by an App admin directly, or a participant with permissions to start a recording, based on the type of authorization used.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit recordings start",
				classification: {
					safeFlags: [
						"allow-multiple-recordings",
						"audio-config-channel",
						"audio-config-codec",
						"audio-config-export-file",
						"interactive-config-type",
						"realtimekit-bucket-config-enabled",
						"storage-config-type",
						"video-config-codec",
						"video-config-export-file",
						"video-config-watermark-position",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["meeting-id"] === undefined) {
						argv["meeting-id"] = await promptForRequiredField(
							"meeting-id",
							"ID of the meeting to record."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit recordings start",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/recordings`,
						pathParams: { "app-id": String(argv["app-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allow_multiple_recordings:
											argv["allow-multiple-recordings"],
										audio_config: {
											channel: argv["audio-config-channel"],
											codec: argv["audio-config-codec"],
											export_file: argv["audio-config-export-file"],
										},
										file_name_prefix: resolveFileToken(
											argv["file-name-prefix"] as string | undefined,
											"file-name-prefix",
											"text"
										),
										interactive_config: {
											type: argv["interactive-config-type"],
										},
										max_seconds: argv["max-seconds"],
										meeting_id: resolveFileToken(
											argv["meeting-id"] as string | undefined,
											"meeting-id",
											"text"
										),
										realtimekit_bucket_config: {
											enabled: argv["realtimekit-bucket-config-enabled"],
										},
										rtmp_out_config: {
											rtmp_url: resolveFileToken(
												argv["rtmp-out-config-rtmp-url"] as string | undefined,
												"rtmp-out-config-rtmp-url",
												"text"
											),
										},
										storage_config: {
											type: argv["storage-config-type"],
										},
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
										video_config: {
											codec: argv["video-config-codec"],
											export_file: argv["video-config-export-file"],
											height: argv["video-config-height"],
											watermark: {
												position: argv["video-config-watermark-position"],
												size: {
													height: argv["video-config-watermark-size-height"],
													width: argv["video-config-watermark-size-width"],
												},
												url: resolveFileToken(
													argv["video-config-watermark-url"] as
														| string
														| undefined,
													"video-config-watermark-url",
													"text"
												),
											},
											width: argv["video-config-width"],
										},
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					allow_multiple_recordings: argv["allow-multiple-recordings"],
					audio_config: {
						channel: argv["audio-config-channel"],
						codec: argv["audio-config-codec"],
						export_file: argv["audio-config-export-file"],
					},
					file_name_prefix: resolveFileToken(
						argv["file-name-prefix"] as string | undefined,
						"file-name-prefix",
						"text"
					),
					interactive_config: {
						type: argv["interactive-config-type"],
					},
					max_seconds: argv["max-seconds"],
					meeting_id: resolveFileToken(
						argv["meeting-id"] as string | undefined,
						"meeting-id",
						"text"
					),
					realtimekit_bucket_config: {
						enabled: argv["realtimekit-bucket-config-enabled"],
					},
					rtmp_out_config: {
						rtmp_url: resolveFileToken(
							argv["rtmp-out-config-rtmp-url"] as string | undefined,
							"rtmp-out-config-rtmp-url",
							"text"
						),
					},
					storage_config: {
						type: argv["storage-config-type"],
					},
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
					video_config: {
						codec: argv["video-config-codec"],
						export_file: argv["video-config-export-file"],
						height: argv["video-config-height"],
						watermark: {
							position: argv["video-config-watermark-position"],
							size: {
								height: argv["video-config-watermark-size-height"],
								width: argv["video-config-watermark-size-width"],
							},
							url: resolveFileToken(
								argv["video-config-watermark-url"] as string | undefined,
								"video-config-watermark-url",
								"text"
							),
						},
						width: argv["video-config-width"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
