import operation from "../../../_operations/realtime/kit/recordings/start.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./start.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
				url: resolveFileToken(argv["url"] as string | undefined, "url", "text"),
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
	);
}
