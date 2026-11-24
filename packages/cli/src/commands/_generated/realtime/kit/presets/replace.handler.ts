import operation from "../../../_operations/realtime/kit/presets/replace.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./replace.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "realtime kit presets replace",
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
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["preset-config-max-screenshare-count"] === undefined) {
					throw new Error(
						"--preset-config-max-screenshare-count is required (or pass --body with this field set)."
					);
				}
				if (argv["preset-config-max-video-streams-desktop"] === undefined) {
					throw new Error(
						"--preset-config-max-video-streams-desktop is required (or pass --body with this field set)."
					);
				}
				if (argv["preset-config-max-video-streams-mobile"] === undefined) {
					throw new Error(
						"--preset-config-max-video-streams-mobile is required (or pass --body with this field set)."
					);
				}
				if (argv["preset-config-media-screenshare-frame-rate"] === undefined) {
					throw new Error(
						"--preset-config-media-screenshare-frame-rate is required (or pass --body with this field set)."
					);
				}
				if (argv["preset-config-media-screenshare-quality"] === undefined) {
					argv["preset-config-media-screenshare-quality"] =
						await promptForRequiredEnumField(
							"preset-config-media-screenshare-quality",
							"Quality of screen share ",
							["hd", "vga", "qvga", "fhd", "uhd"] as const
						);
				}
				if (argv["preset-config-media-video-frame-rate"] === undefined) {
					throw new Error(
						"--preset-config-media-video-frame-rate is required (or pass --body with this field set)."
					);
				}
				if (argv["preset-config-media-video-quality"] === undefined) {
					argv["preset-config-media-video-quality"] =
						await promptForRequiredEnumField(
							"preset-config-media-video-quality",
							"Video quality of participants",
							["hd", "vga", "qvga", "fhd", "uhd"] as const
						);
				}
				if (argv["preset-config-view-type"] === undefined) {
					argv["preset-config-view-type"] = await promptForRequiredEnumField(
						"preset-config-view-type",
						"Type of the meeting",
						["GROUP_CALL", "WEBINAR", "AUDIO_ROOM", "LIVESTREAM"] as const
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the preset"
					);
				}
				if (argv["permissions-accept-waiting-requests"] === undefined) {
					throw new Error(
						"--permissions-accept-waiting-requests is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-can-accept-production-requests"] === undefined) {
					throw new Error(
						"--permissions-can-accept-production-requests is required (or pass --body with this field set)."
					);
				}
				if (
					argv["permissions-can-change-participant-permissions"] === undefined
				) {
					throw new Error(
						"--permissions-can-change-participant-permissions is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-can-edit-display-name"] === undefined) {
					throw new Error(
						"--permissions-can-edit-display-name is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-can-livestream"] === undefined) {
					throw new Error(
						"--permissions-can-livestream is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-can-record"] === undefined) {
					throw new Error(
						"--permissions-can-record is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-can-spotlight"] === undefined) {
					throw new Error(
						"--permissions-can-spotlight is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-chat-private-can-receive"] === undefined) {
					throw new Error(
						"--permissions-chat-private-can-receive is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-chat-private-can-send"] === undefined) {
					throw new Error(
						"--permissions-chat-private-can-send is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-chat-private-files"] === undefined) {
					throw new Error(
						"--permissions-chat-private-files is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-chat-private-text"] === undefined) {
					throw new Error(
						"--permissions-chat-private-text is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-chat-public-can-send"] === undefined) {
					throw new Error(
						"--permissions-chat-public-can-send is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-chat-public-files"] === undefined) {
					throw new Error(
						"--permissions-chat-public-files is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-chat-public-text"] === undefined) {
					throw new Error(
						"--permissions-chat-public-text is required (or pass --body with this field set)."
					);
				}
				if (
					argv[
						"permissions-connected-meetings-can-alter-connected-meetings"
					] === undefined
				) {
					throw new Error(
						"--permissions-connected-meetings-can-alter-connected-meetings is required (or pass --body with this field set)."
					);
				}
				if (
					argv[
						"permissions-connected-meetings-can-switch-connected-meetings"
					] === undefined
				) {
					throw new Error(
						"--permissions-connected-meetings-can-switch-connected-meetings is required (or pass --body with this field set)."
					);
				}
				if (
					argv[
						"permissions-connected-meetings-can-switch-to-parent-meeting"
					] === undefined
				) {
					throw new Error(
						"--permissions-connected-meetings-can-switch-to-parent-meeting is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-disable-participant-audio"] === undefined) {
					throw new Error(
						"--permissions-disable-participant-audio is required (or pass --body with this field set)."
					);
				}
				if (
					argv["permissions-disable-participant-screensharing"] === undefined
				) {
					throw new Error(
						"--permissions-disable-participant-screensharing is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-disable-participant-video"] === undefined) {
					throw new Error(
						"--permissions-disable-participant-video is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-hidden-participant"] === undefined) {
					throw new Error(
						"--permissions-hidden-participant is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-kick-participant"] === undefined) {
					throw new Error(
						"--permissions-kick-participant is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-media-audio-can-produce"] === undefined) {
					argv["permissions-media-audio-can-produce"] =
						await promptForRequiredEnumField(
							"permissions-media-audio-can-produce",
							"Can produce audio",
							["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"] as const
						);
				}
				if (argv["permissions-media-screenshare-can-produce"] === undefined) {
					argv["permissions-media-screenshare-can-produce"] =
						await promptForRequiredEnumField(
							"permissions-media-screenshare-can-produce",
							"Can produce screen share video",
							["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"] as const
						);
				}
				if (argv["permissions-media-video-can-produce"] === undefined) {
					argv["permissions-media-video-can-produce"] =
						await promptForRequiredEnumField(
							"permissions-media-video-can-produce",
							"Can produce video",
							["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"] as const
						);
				}
				if (argv["permissions-pin-participant"] === undefined) {
					throw new Error(
						"--permissions-pin-participant is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-plugins-can-close"] === undefined) {
					throw new Error(
						"--permissions-plugins-can-close is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-plugins-can-edit-config"] === undefined) {
					throw new Error(
						"--permissions-plugins-can-edit-config is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-plugins-can-start"] === undefined) {
					throw new Error(
						"--permissions-plugins-can-start is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-plugins-config"] === undefined) {
					throw new Error(
						"--permissions-plugins-config is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-polls-can-create"] === undefined) {
					throw new Error(
						"--permissions-polls-can-create is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-polls-can-view"] === undefined) {
					throw new Error(
						"--permissions-polls-can-view is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-polls-can-vote"] === undefined) {
					throw new Error(
						"--permissions-polls-can-vote is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-recorder-type"] === undefined) {
					argv["permissions-recorder-type"] = await promptForRequiredEnumField(
						"permissions-recorder-type",
						"Type of the recording peer",
						["RECORDER", "LIVESTREAMER", "NONE"] as const
					);
				}
				if (argv["permissions-show-participant-list"] === undefined) {
					throw new Error(
						"--permissions-show-participant-list is required (or pass --body with this field set)."
					);
				}
				if (argv["permissions-waiting-room-type"] === undefined) {
					argv["permissions-waiting-room-type"] =
						await promptForRequiredEnumField(
							"permissions-waiting-room-type",
							"Waiting room type",
							["SKIP", "ON_PRIVILEGED_USER_ENTRY", "SKIP_ON_ACCEPT"] as const
						);
				}
				if (argv["ui-design-tokens-border-radius"] === undefined) {
					argv["ui-design-tokens-border-radius"] =
						await promptForRequiredEnumField(
							"ui-design-tokens-border-radius",
							"The ui.design_tokens.border_radius field",
							["sharp", "rounded", "extra-rounded", "circular"] as const
						);
				}
				if (argv["ui-design-tokens-border-width"] === undefined) {
					argv["ui-design-tokens-border-width"] =
						await promptForRequiredEnumField(
							"ui-design-tokens-border-width",
							"The ui.design_tokens.border_width field",
							["none", "thin", "fat"] as const
						);
				}
				if (argv["ui-design-tokens-colors-danger"] === undefined) {
					argv["ui-design-tokens-colors-danger"] = await promptForRequiredField(
						"ui-design-tokens-colors-danger",
						"The ui.design_tokens.colors.danger field"
					);
				}
				if (argv["ui-design-tokens-colors-success"] === undefined) {
					argv["ui-design-tokens-colors-success"] =
						await promptForRequiredField(
							"ui-design-tokens-colors-success",
							"The ui.design_tokens.colors.success field"
						);
				}
				if (argv["ui-design-tokens-colors-text"] === undefined) {
					argv["ui-design-tokens-colors-text"] = await promptForRequiredField(
						"ui-design-tokens-colors-text",
						"The ui.design_tokens.colors.text field"
					);
				}
				if (argv["ui-design-tokens-colors-text-on-brand"] === undefined) {
					argv["ui-design-tokens-colors-text-on-brand"] =
						await promptForRequiredField(
							"ui-design-tokens-colors-text-on-brand",
							"The ui.design_tokens.colors.text_on_brand field"
						);
				}
				if (argv["ui-design-tokens-colors-video-bg"] === undefined) {
					argv["ui-design-tokens-colors-video-bg"] =
						await promptForRequiredField(
							"ui-design-tokens-colors-video-bg",
							"The ui.design_tokens.colors.video_bg field"
						);
				}
				if (argv["ui-design-tokens-colors-warning"] === undefined) {
					argv["ui-design-tokens-colors-warning"] =
						await promptForRequiredField(
							"ui-design-tokens-colors-warning",
							"The ui.design_tokens.colors.warning field"
						);
				}
				if (argv["ui-design-tokens-spacing-base"] === undefined) {
					throw new Error(
						"--ui-design-tokens-spacing-base is required (or pass --body with this field set)."
					);
				}
				if (argv["ui-design-tokens-theme"] === undefined) {
					argv["ui-design-tokens-theme"] = await promptForRequiredEnumField(
						"ui-design-tokens-theme",
						"The ui.design_tokens.theme field",
						["darkest", "dark", "light"] as const
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf realtime kit presets replace",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/presets/${argv["preset-id"] == null ? "<preset-id>" : encodeURIComponent(String(argv["preset-id"]))}`,
					pathParams: {
						"app-id": String(argv["app-id"] ?? ""),
						"preset-id": String(argv["preset-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body, [
									{
										path: ["permissions", "plugins", "config"],
										flag: "permissions-plugins-config",
									},
								])
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
													"permissions-plugins-config",
													true
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
				argv.body !== undefined
					? parseBody(argv.body, [
							{
								path: ["permissions", "plugins", "config"],
								flag: "permissions-plugins-config",
							},
						])
					: undefined;
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
			await resolveRequiredFields();

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
								"permissions-plugins-config",
								true
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
