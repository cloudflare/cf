import operation from "../../../_operations/realtime/kit/presets/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "realtime kit presets edit",
			classification: {
				safeFlags: [
					"preset-config-media-audio-enable-high-bitrate",
					"preset-config-media-audio-enable-stereo",
					"preset-config-media-screenshare-quality",
					"preset-config-media-video-quality",
					"preset-config-media-video-simulcast",
					"preset-config-view-type",
					"permissions-accept-stage-requests",
					"permissions-accept-waiting-requests",
					"permissions-can-accept-production-requests",
					"permissions-can-change-participant-permissions",
					"permissions-can-edit-display-name",
					"permissions-can-edit-meeting-title",
					"permissions-can-livestream",
					"permissions-can-record",
					"permissions-can-spotlight",
					"permissions-chat-private-can-receive",
					"permissions-chat-private-can-send",
					"permissions-chat-private-files",
					"permissions-chat-private-text",
					"permissions-chat-public-can-send",
					"permissions-chat-public-files",
					"permissions-chat-public-text",
					"permissions-connected-meetings-can-alter-connected-meetings",
					"permissions-connected-meetings-can-switch-connected-meetings",
					"permissions-connected-meetings-can-switch-to-parent-meeting",
					"permissions-disable-participant-audio",
					"permissions-disable-participant-screensharing",
					"permissions-disable-participant-video",
					"permissions-hidden-participant",
					"permissions-is-recorder",
					"permissions-kick-participant",
					"permissions-media-audio-can-produce",
					"permissions-media-screenshare-can-produce",
					"permissions-media-video-can-produce",
					"permissions-pin-participant",
					"permissions-plugins-can-close",
					"permissions-plugins-can-edit-config",
					"permissions-plugins-can-start",
					"permissions-polls-can-create",
					"permissions-polls-can-view",
					"permissions-polls-can-vote",
					"permissions-recorder-type",
					"permissions-show-participant-list",
					"permissions-stage-access",
					"permissions-stage-enabled",
					"permissions-transcription-enabled",
					"permissions-waiting-room-type",
					"ui-design-tokens-border-radius",
					"ui-design-tokens-border-width",
					"ui-design-tokens-theme",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf realtime kit presets edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/presets/${argv["preset-id"] == null ? "<preset-id>" : encodeURIComponent(String(argv["preset-id"]))}`,
					pathParams: {
						"app-id": String(argv["app-id"] ?? ""),
						"preset-id": String(argv["preset-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										config: {
											livestream_viewer_qualities:
												argv["preset-config-livestream-viewer-qualities"],
											max_screenshare_count:
												argv["preset-config-max-screenshare-count"],
											max_video_streams: {
												desktop:
													argv["preset-config-max-video-streams-desktop"],
												mobile: argv["preset-config-max-video-streams-mobile"],
											},
											media: {
												audio: {
													enable_high_bitrate:
														argv[
															"preset-config-media-audio-enable-high-bitrate"
														],
													enable_stereo:
														argv["preset-config-media-audio-enable-stereo"],
												},
												screenshare: {
													frame_rate:
														argv["preset-config-media-screenshare-frame-rate"],
													quality:
														argv["preset-config-media-screenshare-quality"],
												},
												video: {
													frame_rate:
														argv["preset-config-media-video-frame-rate"],
													quality: argv["preset-config-media-video-quality"],
													simulcast:
														argv["preset-config-media-video-simulcast"],
												},
											},
											view_type: argv["preset-config-view-type"],
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										permissions: {
											accept_stage_requests:
												argv["permissions-accept-stage-requests"],
											accept_waiting_requests:
												argv["permissions-accept-waiting-requests"],
											can_accept_production_requests:
												argv["permissions-can-accept-production-requests"],
											can_change_participant_permissions:
												argv["permissions-can-change-participant-permissions"],
											can_edit_display_name:
												argv["permissions-can-edit-display-name"],
											can_edit_meeting_title:
												argv["permissions-can-edit-meeting-title"],
											can_livestream: argv["permissions-can-livestream"],
											can_record: argv["permissions-can-record"],
											can_spotlight: argv["permissions-can-spotlight"],
											chat: {
												private: {
													can_receive:
														argv["permissions-chat-private-can-receive"],
													can_send: argv["permissions-chat-private-can-send"],
													files: argv["permissions-chat-private-files"],
													text: argv["permissions-chat-private-text"],
												},
												public: {
													can_send: argv["permissions-chat-public-can-send"],
													files: argv["permissions-chat-public-files"],
													text: argv["permissions-chat-public-text"],
												},
											},
											connected_meetings: {
												can_alter_connected_meetings:
													argv[
														"permissions-connected-meetings-can-alter-connected-meetings"
													],
												can_switch_connected_meetings:
													argv[
														"permissions-connected-meetings-can-switch-connected-meetings"
													],
												can_switch_to_parent_meeting:
													argv[
														"permissions-connected-meetings-can-switch-to-parent-meeting"
													],
											},
											disable_participant_audio:
												argv["permissions-disable-participant-audio"],
											disable_participant_screensharing:
												argv["permissions-disable-participant-screensharing"],
											disable_participant_video:
												argv["permissions-disable-participant-video"],
											hidden_participant:
												argv["permissions-hidden-participant"],
											is_recorder: argv["permissions-is-recorder"],
											kick_participant: argv["permissions-kick-participant"],
											media: {
												audio: {
													can_produce:
														argv["permissions-media-audio-can-produce"],
												},
												screenshare: {
													can_produce:
														argv["permissions-media-screenshare-can-produce"],
												},
												video: {
													can_produce:
														argv["permissions-media-video-can-produce"],
												},
											},
											pin_participant: argv["permissions-pin-participant"],
											plugins: {
												can_close: argv["permissions-plugins-can-close"],
												can_edit_config:
													argv["permissions-plugins-can-edit-config"],
												can_start: argv["permissions-plugins-can-start"],
												config: parseJsonMap(
													argv["permissions-plugins-config"],
													"permissions-plugins-config"
												),
											},
											polls: {
												can_create: argv["permissions-polls-can-create"],
												can_view: argv["permissions-polls-can-view"],
												can_vote: argv["permissions-polls-can-vote"],
											},
											recorder_type: argv["permissions-recorder-type"],
											show_participant_list:
												argv["permissions-show-participant-list"],
											stage_access: argv["permissions-stage-access"],
											stage_enabled: argv["permissions-stage-enabled"],
											transcription_enabled:
												argv["permissions-transcription-enabled"],
											waiting_room_type: argv["permissions-waiting-room-type"],
										},
										ui: {
											design_tokens: {
												border_radius: argv["ui-design-tokens-border-radius"],
												border_width: argv["ui-design-tokens-border-width"],
												colors: {
													danger: resolveFileToken(
														argv["ui-design-tokens-colors-danger"] as
															| string
															| undefined,
														"ui-design-tokens-colors-danger",
														"text"
													),
													success: resolveFileToken(
														argv["ui-design-tokens-colors-success"] as
															| string
															| undefined,
														"ui-design-tokens-colors-success",
														"text"
													),
													text: resolveFileToken(
														argv["ui-design-tokens-colors-text"] as
															| string
															| undefined,
														"ui-design-tokens-colors-text",
														"text"
													),
													text_on_brand: resolveFileToken(
														argv["ui-design-tokens-colors-text-on-brand"] as
															| string
															| undefined,
														"ui-design-tokens-colors-text-on-brand",
														"text"
													),
													video_bg: resolveFileToken(
														argv["ui-design-tokens-colors-video-bg"] as
															| string
															| undefined,
														"ui-design-tokens-colors-video-bg",
														"text"
													),
													warning: resolveFileToken(
														argv["ui-design-tokens-colors-warning"] as
															| string
															| undefined,
														"ui-design-tokens-colors-warning",
														"text"
													),
												},
												font_family: resolveFileToken(
													argv["ui-design-tokens-font-family"] as
														| string
														| undefined,
													"ui-design-tokens-font-family",
													"text"
												),
												google_font: resolveFileToken(
													argv["ui-design-tokens-google-font"] as
														| string
														| undefined,
													"ui-design-tokens-google-font",
													"text"
												),
												logo: resolveFileToken(
													argv["ui-design-tokens-logo"] as string | undefined,
													"ui-design-tokens-logo",
													"text"
												),
												spacing_base: argv["ui-design-tokens-spacing-base"],
												theme: argv["ui-design-tokens-theme"],
											},
										},
									},
									[["permissions", "plugins", "config"]]
								),
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
						preset_id: argv["preset-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					config: {
						livestream_viewer_qualities:
							argv["preset-config-livestream-viewer-qualities"],
						max_screenshare_count: argv["preset-config-max-screenshare-count"],
						max_video_streams: {
							desktop: argv["preset-config-max-video-streams-desktop"],
							mobile: argv["preset-config-max-video-streams-mobile"],
						},
						media: {
							audio: {
								enable_high_bitrate:
									argv["preset-config-media-audio-enable-high-bitrate"],
								enable_stereo: argv["preset-config-media-audio-enable-stereo"],
							},
							screenshare: {
								frame_rate: argv["preset-config-media-screenshare-frame-rate"],
								quality: argv["preset-config-media-screenshare-quality"],
							},
							video: {
								frame_rate: argv["preset-config-media-video-frame-rate"],
								quality: argv["preset-config-media-video-quality"],
								simulcast: argv["preset-config-media-video-simulcast"],
							},
						},
						view_type: argv["preset-config-view-type"],
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					permissions: {
						accept_stage_requests: argv["permissions-accept-stage-requests"],
						accept_waiting_requests:
							argv["permissions-accept-waiting-requests"],
						can_accept_production_requests:
							argv["permissions-can-accept-production-requests"],
						can_change_participant_permissions:
							argv["permissions-can-change-participant-permissions"],
						can_edit_display_name: argv["permissions-can-edit-display-name"],
						can_edit_meeting_title: argv["permissions-can-edit-meeting-title"],
						can_livestream: argv["permissions-can-livestream"],
						can_record: argv["permissions-can-record"],
						can_spotlight: argv["permissions-can-spotlight"],
						chat: {
							private: {
								can_receive: argv["permissions-chat-private-can-receive"],
								can_send: argv["permissions-chat-private-can-send"],
								files: argv["permissions-chat-private-files"],
								text: argv["permissions-chat-private-text"],
							},
							public: {
								can_send: argv["permissions-chat-public-can-send"],
								files: argv["permissions-chat-public-files"],
								text: argv["permissions-chat-public-text"],
							},
						},
						connected_meetings: {
							can_alter_connected_meetings:
								argv[
									"permissions-connected-meetings-can-alter-connected-meetings"
								],
							can_switch_connected_meetings:
								argv[
									"permissions-connected-meetings-can-switch-connected-meetings"
								],
							can_switch_to_parent_meeting:
								argv[
									"permissions-connected-meetings-can-switch-to-parent-meeting"
								],
						},
						disable_participant_audio:
							argv["permissions-disable-participant-audio"],
						disable_participant_screensharing:
							argv["permissions-disable-participant-screensharing"],
						disable_participant_video:
							argv["permissions-disable-participant-video"],
						hidden_participant: argv["permissions-hidden-participant"],
						is_recorder: argv["permissions-is-recorder"],
						kick_participant: argv["permissions-kick-participant"],
						media: {
							audio: {
								can_produce: argv["permissions-media-audio-can-produce"],
							},
							screenshare: {
								can_produce: argv["permissions-media-screenshare-can-produce"],
							},
							video: {
								can_produce: argv["permissions-media-video-can-produce"],
							},
						},
						pin_participant: argv["permissions-pin-participant"],
						plugins: {
							can_close: argv["permissions-plugins-can-close"],
							can_edit_config: argv["permissions-plugins-can-edit-config"],
							can_start: argv["permissions-plugins-can-start"],
							config: parseJsonMap(
								argv["permissions-plugins-config"],
								"permissions-plugins-config"
							),
						},
						polls: {
							can_create: argv["permissions-polls-can-create"],
							can_view: argv["permissions-polls-can-view"],
							can_vote: argv["permissions-polls-can-vote"],
						},
						recorder_type: argv["permissions-recorder-type"],
						show_participant_list: argv["permissions-show-participant-list"],
						stage_access: argv["permissions-stage-access"],
						stage_enabled: argv["permissions-stage-enabled"],
						transcription_enabled: argv["permissions-transcription-enabled"],
						waiting_room_type: argv["permissions-waiting-room-type"],
					},
					ui: {
						design_tokens: {
							border_radius: argv["ui-design-tokens-border-radius"],
							border_width: argv["ui-design-tokens-border-width"],
							colors: {
								danger: resolveFileToken(
									argv["ui-design-tokens-colors-danger"] as string | undefined,
									"ui-design-tokens-colors-danger",
									"text"
								),
								success: resolveFileToken(
									argv["ui-design-tokens-colors-success"] as string | undefined,
									"ui-design-tokens-colors-success",
									"text"
								),
								text: resolveFileToken(
									argv["ui-design-tokens-colors-text"] as string | undefined,
									"ui-design-tokens-colors-text",
									"text"
								),
								text_on_brand: resolveFileToken(
									argv["ui-design-tokens-colors-text-on-brand"] as
										| string
										| undefined,
									"ui-design-tokens-colors-text-on-brand",
									"text"
								),
								video_bg: resolveFileToken(
									argv["ui-design-tokens-colors-video-bg"] as
										| string
										| undefined,
									"ui-design-tokens-colors-video-bg",
									"text"
								),
								warning: resolveFileToken(
									argv["ui-design-tokens-colors-warning"] as string | undefined,
									"ui-design-tokens-colors-warning",
									"text"
								),
							},
							font_family: resolveFileToken(
								argv["ui-design-tokens-font-family"] as string | undefined,
								"ui-design-tokens-font-family",
								"text"
							),
							google_font: resolveFileToken(
								argv["ui-design-tokens-google-font"] as string | undefined,
								"ui-design-tokens-google-font",
								"text"
							),
							logo: resolveFileToken(
								argv["ui-design-tokens-logo"] as string | undefined,
								"ui-design-tokens-logo",
								"text"
							),
							spacing_base: argv["ui-design-tokens-spacing-base"],
							theme: argv["ui-design-tokens-theme"],
						},
					},
				},
				[["permissions", "plugins", "config"]]
			);
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					app_id: argv["app-id"],
					preset_id: argv["preset-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
