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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * start command
 * @generated from apis/overlays/realtime.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit recordings start <app-id>\n\nStarts recording a meeting. The meeting can be started by an App admin directly, or a participant with permissions to start a recording, based on the type of authorization used."
		)
		.positional("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("allow-multiple-recordings", {
			type: "boolean",
			description:
				"By default, a meeting allows only one recording to run at a time. Enabling the `allow_multiple_recordings` parameter to true allows you to initiate multiple recordings concurrently in the same meeting. This allows you to record separate videos of the same meeting with different configurations, such as portrait mode or landscape mode.",
			default: false,
		})
		.option("audio-config-channel", {
			type: "string",
			description:
				"Audio signal pathway within an audio file that carries a specific sound source.",
			choices: ["mono", "stereo"],
		})
		.option("audio-config-codec", {
			type: "string",
			description:
				"Codec using which the recording will be encoded. If VP8/VP9 is selected for videoConfig, changing audioConfig is not allowed. In this case, the codec in the audioConfig is automatically set to vorbis.",
			choices: ["MP3", "AAC"],
		})
		.option("audio-config-export-file", {
			type: "boolean",
			description: "Controls whether to export audio file seperately",
		})
		.option("file-name-prefix", {
			type: "string",
			description: "Update the recording file name.",
		})
		.option("interactive-config-type", {
			type: "string",
			description: "The metadata is presented in the form of ID3 tags.",
			choices: ["ID3"],
		})
		.option("max-seconds", {
			type: "number",
			description:
				"Specifies the maximum duration for recording in seconds, ranging from a minimum of 60 seconds to a maximum of 24 hours.",
		})
		.option("meeting-id", {
			type: "string",
			description: "ID of the meeting to record.",
		})
		.option("realtimekit-bucket-config-enabled", {
			type: "boolean",
			description:
				"Controls whether recordings are uploaded to RealtimeKit's bucket. If set to false, `download_url`, `audio_download_url`, `download_url_expiry` won't be generated for a recording.",
		})
		.option("rtmp-out-config-rtmp-url", {
			type: "string",
			description: "RTMP URL to stream to",
		})
		.option("url", {
			type: "string",
			description: "Pass a custom url to record arbitary screen",
		})
		.option("video-config-codec", {
			type: "string",
			description: "Codec using which the recording will be encoded.",
			choices: ["H264", "VP8", "VP9"],
		})
		.option("video-config-export-file", {
			type: "boolean",
			description: "Controls whether to export video file seperately",
		})
		.option("video-config-height", {
			type: "number",
			description: "Height of the recording video in pixels",
		})
		.option("video-config-watermark-position", {
			type: "string",
			description: "Position of the watermark",
			choices: ["left top", "right top", "left bottom", "right bottom"],
		})
		.option("video-config-watermark-size-height", {
			type: "number",
			description: "Height of the watermark in px",
		})
		.option("video-config-watermark-size-width", {
			type: "number",
			description: "Width of the watermark in px",
		})
		.option("video-config-watermark-url", {
			type: "string",
			description: "URL of the watermark image",
		})
		.option("video-config-width", {
			type: "number",
			description: "Width of the recording video in pixels",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = ["realtimekit-bucket-config-enabled"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["realtimekit-bucket-config-enabled"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --realtimekit_bucket_config-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"start_recording">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "start <app-id>",
	describe: "Start recording a meeting",
	builder,
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
						"video-config-codec",
						"video-config-export-file",
						"video-config-watermark-position",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
											channel: resolveFileToken(
												argv["audio-config-channel"] as string | undefined,
												"audio-config-channel",
												"text"
											),
											codec: resolveFileToken(
												argv["audio-config-codec"] as string | undefined,
												"audio-config-codec",
												"text"
											),
											export_file: argv["audio-config-export-file"],
										},
										file_name_prefix: resolveFileToken(
											argv["file-name-prefix"] as string | undefined,
											"file-name-prefix",
											"text"
										),
										interactive_config: {
											type: resolveFileToken(
												argv["interactive-config-type"] as string | undefined,
												"interactive-config-type",
												"text"
											),
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
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
										video_config: {
											codec: resolveFileToken(
												argv["video-config-codec"] as string | undefined,
												"video-config-codec",
												"text"
											),
											export_file: argv["video-config-export-file"],
											height: argv["video-config-height"],
											watermark: {
												position: resolveFileToken(
													argv["video-config-watermark-position"] as
														| string
														| undefined,
													"video-config-watermark-position",
													"text"
												),
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.realtime.kit.recordings.start({
							...bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["meeting-id"] === undefined) {
					argv["meeting-id"] = await promptForRequiredField(
						"meeting-id",
						"ID of the meeting to record."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					allow_multiple_recordings: argv["allow-multiple-recordings"],
					audio_config: {
						channel: resolveFileToken(
							argv["audio-config-channel"] as string | undefined,
							"audio-config-channel",
							"text"
						),
						codec: resolveFileToken(
							argv["audio-config-codec"] as string | undefined,
							"audio-config-codec",
							"text"
						),
						export_file: argv["audio-config-export-file"],
					},
					file_name_prefix: resolveFileToken(
						argv["file-name-prefix"] as string | undefined,
						"file-name-prefix",
						"text"
					),
					interactive_config: {
						type: resolveFileToken(
							argv["interactive-config-type"] as string | undefined,
							"interactive-config-type",
							"text"
						),
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
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
					video_config: {
						codec: resolveFileToken(
							argv["video-config-codec"] as string | undefined,
							"video-config-codec",
							"text"
						),
						export_file: argv["video-config-export-file"],
						height: argv["video-config-height"],
						watermark: {
							position: resolveFileToken(
								argv["video-config-watermark-position"] as string | undefined,
								"video-config-watermark-position",
								"text"
							),
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
					client.realtime.kit.recordings.start({
						...bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
