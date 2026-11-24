import operation from "../../../_operations/realtime/kit/presets/edit.js";
/**
 * edit command
 * @generated from apis/overlays/realtime.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "edit <preset-id>",
	describe: "Update a preset",
	usage:
		"$0 realtime kit presets edit <preset-id>\n\nUpdate a preset by the provided preset ID",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"preset-config-livestream-viewer-qualities": {
			kind: "parsed",
			brief: "Livestream viewer quality levels.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"preset-config-max-screenshare-count": {
			kind: "parsed",
			brief:
				"Maximum number of screen shares that can be active at a given time",
			optional: true,
			parse: Number,
		},
		"preset-config-max-video-streams-desktop": {
			kind: "parsed",
			brief: "Maximum number of video streams visible on desktop devices",
			optional: true,
			parse: Number,
		},
		"preset-config-max-video-streams-mobile": {
			kind: "parsed",
			brief: "Maximum number of streams visible on mobile devices",
			optional: true,
			parse: Number,
		},
		"preset-config-media-audio-enable-high-bitrate": {
			kind: "boolean",
			brief: "Enable High Quality Audio for your meetings",
			optional: true,
		},
		"preset-config-media-audio-enable-stereo": {
			kind: "boolean",
			brief: "Enable Stereo for your meetings",
			optional: true,
		},
		"preset-config-media-screenshare-frame-rate": {
			kind: "parsed",
			brief: "Frame rate of screen share",
			optional: true,
			parse: Number,
		},
		"preset-config-media-screenshare-quality": {
			kind: "parsed",
			brief: "Quality of screen share ",
			optional: true,
			choices: ["hd", "vga", "qvga", "fhd", "uhd"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"preset-config-media-screenshare-quality",
					"text"
				),
		},
		"preset-config-media-video-frame-rate": {
			kind: "parsed",
			brief: "Frame rate of participants' video",
			optional: true,
			parse: Number,
		},
		"preset-config-media-video-quality": {
			kind: "parsed",
			brief: "Video quality of participants",
			optional: true,
			choices: ["hd", "vga", "qvga", "fhd", "uhd"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "preset-config-media-video-quality", "text"),
		},
		"preset-config-media-video-simulcast": {
			kind: "boolean",
			brief: "Enable simulcast for participant videos.",
			optional: true,
		},
		"preset-config-view-type": {
			kind: "parsed",
			brief: "Type of the meeting",
			optional: true,
			choices: ["GROUP_CALL", "WEBINAR", "AUDIO_ROOM", "LIVESTREAM"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "preset-config-view-type", "text"),
		},
		name: {
			kind: "parsed",
			brief: "Name of the preset",
			optional: true,
			parse: String,
		},
		"permissions-accept-stage-requests": {
			kind: "boolean",
			brief: "The permissions.accept_stage_requests field",
			optional: true,
		},
		"permissions-accept-waiting-requests": {
			kind: "boolean",
			brief: "Whether this participant can accept waiting requests",
			optional: true,
		},
		"permissions-can-accept-production-requests": {
			kind: "boolean",
			brief: "The permissions.can_accept_production_requests field",
			optional: true,
		},
		"permissions-can-change-participant-permissions": {
			kind: "boolean",
			brief: "The permissions.can_change_participant_permissions field",
			optional: true,
		},
		"permissions-can-edit-display-name": {
			kind: "boolean",
			brief: "The permissions.can_edit_display_name field",
			optional: true,
		},
		"permissions-can-edit-meeting-title": {
			kind: "boolean",
			brief: "Allows renaming the meeting for the current session",
			optional: true,
		},
		"permissions-can-livestream": {
			kind: "boolean",
			brief: "The permissions.can_livestream field",
			optional: true,
		},
		"permissions-can-record": {
			kind: "boolean",
			brief: "The permissions.can_record field",
			optional: true,
		},
		"permissions-can-spotlight": {
			kind: "boolean",
			brief: "The permissions.can_spotlight field",
			optional: true,
		},
		"permissions-chat-private-can-receive": {
			kind: "boolean",
			brief: "The permissions.chat.private.can_receive field",
			optional: true,
		},
		"permissions-chat-private-can-send": {
			kind: "boolean",
			brief: "The permissions.chat.private.can_send field",
			optional: true,
		},
		"permissions-chat-private-files": {
			kind: "boolean",
			brief: "The permissions.chat.private.files field",
			optional: true,
		},
		"permissions-chat-private-text": {
			kind: "boolean",
			brief: "The permissions.chat.private.text field",
			optional: true,
		},
		"permissions-chat-public-can-send": {
			kind: "boolean",
			brief: "Can send messages in general",
			optional: true,
		},
		"permissions-chat-public-files": {
			kind: "boolean",
			brief: "Can send file messages",
			optional: true,
		},
		"permissions-chat-public-text": {
			kind: "boolean",
			brief: "Can send text messages",
			optional: true,
		},
		"permissions-connected-meetings-can-alter-connected-meetings": {
			kind: "boolean",
			brief:
				"The permissions.connected_meetings.can_alter_connected_meetings field",
			optional: true,
		},
		"permissions-connected-meetings-can-switch-connected-meetings": {
			kind: "boolean",
			brief:
				"The permissions.connected_meetings.can_switch_connected_meetings field",
			optional: true,
		},
		"permissions-connected-meetings-can-switch-to-parent-meeting": {
			kind: "boolean",
			brief:
				"The permissions.connected_meetings.can_switch_to_parent_meeting field",
			optional: true,
		},
		"permissions-disable-participant-audio": {
			kind: "boolean",
			brief: "The permissions.disable_participant_audio field",
			optional: true,
		},
		"permissions-disable-participant-screensharing": {
			kind: "boolean",
			brief: "The permissions.disable_participant_screensharing field",
			optional: true,
		},
		"permissions-disable-participant-video": {
			kind: "boolean",
			brief: "The permissions.disable_participant_video field",
			optional: true,
		},
		"permissions-hidden-participant": {
			kind: "boolean",
			brief: "Whether this participant is visible to others or not",
			optional: true,
		},
		"permissions-is-recorder": {
			kind: "boolean",
			brief: "The permissions.is_recorder field",
			optional: true,
		},
		"permissions-kick-participant": {
			kind: "boolean",
			brief: "The permissions.kick_participant field",
			optional: true,
		},
		"permissions-media-audio-can-produce": {
			kind: "parsed",
			brief: "Can produce audio",
			optional: true,
			choices: ["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "permissions-media-audio-can-produce", "text"),
		},
		"permissions-media-screenshare-can-produce": {
			kind: "parsed",
			brief: "Can produce screen share video",
			optional: true,
			choices: ["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"permissions-media-screenshare-can-produce",
					"text"
				),
		},
		"permissions-media-video-can-produce": {
			kind: "parsed",
			brief: "Can produce video",
			optional: true,
			choices: ["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "permissions-media-video-can-produce", "text"),
		},
		"permissions-pin-participant": {
			kind: "boolean",
			brief: "The permissions.pin_participant field",
			optional: true,
		},
		"permissions-plugins-can-close": {
			kind: "boolean",
			brief: "Can close plugins that are already open",
			optional: true,
		},
		"permissions-plugins-can-edit-config": {
			kind: "boolean",
			brief: "Can edit plugin config",
			optional: true,
		},
		"permissions-plugins-can-start": {
			kind: "boolean",
			brief: "Can start plugins",
			optional: true,
		},
		"permissions-plugins-config": {
			kind: "parsed",
			brief:
				'Plugin configuration keyed by plugin UUID. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"permissions-polls-can-create": {
			kind: "boolean",
			brief: "Can create polls",
			optional: true,
		},
		"permissions-polls-can-view": {
			kind: "boolean",
			brief: "Can view polls",
			optional: true,
		},
		"permissions-polls-can-vote": {
			kind: "boolean",
			brief: "Can vote on polls",
			optional: true,
		},
		"permissions-recorder-type": {
			kind: "parsed",
			brief: "Type of the recording peer",
			optional: true,
			choices: ["RECORDER", "LIVESTREAMER", "NONE"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "permissions-recorder-type", "text"),
		},
		"permissions-show-participant-list": {
			kind: "boolean",
			brief: "The permissions.show_participant_list field",
			optional: true,
		},
		"permissions-stage-access": {
			kind: "parsed",
			brief: "The permissions.stage_access field",
			optional: true,
			choices: ["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "permissions-stage-access", "text"),
		},
		"permissions-stage-enabled": {
			kind: "boolean",
			brief: "The permissions.stage_enabled field",
			optional: true,
		},
		"permissions-transcription-enabled": {
			kind: "boolean",
			brief: "The permissions.transcription_enabled field",
			optional: true,
		},
		"permissions-waiting-room-type": {
			kind: "parsed",
			brief: "Waiting room type",
			optional: true,
			choices: ["SKIP", "ON_PRIVILEGED_USER_ENTRY", "SKIP_ON_ACCEPT"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "permissions-waiting-room-type", "text"),
		},
		"ui-design-tokens-border-radius": {
			kind: "parsed",
			brief: "The ui.design_tokens.border_radius field",
			optional: true,
			choices: ["sharp", "rounded", "extra-rounded", "circular"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ui-design-tokens-border-radius", "text"),
		},
		"ui-design-tokens-border-width": {
			kind: "parsed",
			brief: "The ui.design_tokens.border_width field",
			optional: true,
			choices: ["none", "thin", "fat"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ui-design-tokens-border-width", "text"),
		},
		"ui-design-tokens-colors-danger": {
			kind: "parsed",
			brief: "The ui.design_tokens.colors.danger field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-colors-success": {
			kind: "parsed",
			brief: "The ui.design_tokens.colors.success field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-colors-text": {
			kind: "parsed",
			brief: "The ui.design_tokens.colors.text field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-colors-text-on-brand": {
			kind: "parsed",
			brief: "The ui.design_tokens.colors.text_on_brand field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-colors-video-bg": {
			kind: "parsed",
			brief: "The ui.design_tokens.colors.video_bg field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-colors-warning": {
			kind: "parsed",
			brief: "The ui.design_tokens.colors.warning field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-font-family": {
			kind: "parsed",
			brief: "The ui.design_tokens.font_family field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-google-font": {
			kind: "parsed",
			brief: "The ui.design_tokens.google_font field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-logo": {
			kind: "parsed",
			brief: "The ui.design_tokens.logo field",
			optional: true,
			parse: String,
		},
		"ui-design-tokens-spacing-base": {
			kind: "parsed",
			brief: "The ui.design_tokens.spacing_base field",
			optional: true,
			parse: Number,
		},
		"ui-design-tokens-theme": {
			kind: "parsed",
			brief: "The ui.design_tokens.theme field",
			optional: true,
			choices: ["darkest", "dark", "light"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "ui-design-tokens-theme", "text"),
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
			placeholder: "preset-id",
			brief: "ID of the preset to fetch",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
													mobile:
														argv["preset-config-max-video-streams-mobile"],
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
															argv[
																"preset-config-media-screenshare-frame-rate"
															],
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
													argv[
														"permissions-can-change-participant-permissions"
													],
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
												waiting_room_type:
													argv["permissions-waiting-room-type"],
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
							max_screenshare_count:
								argv["preset-config-max-screenshare-count"],
							max_video_streams: {
								desktop: argv["preset-config-max-video-streams-desktop"],
								mobile: argv["preset-config-max-video-streams-mobile"],
							},
							media: {
								audio: {
									enable_high_bitrate:
										argv["preset-config-media-audio-enable-high-bitrate"],
									enable_stereo:
										argv["preset-config-media-audio-enable-stereo"],
								},
								screenshare: {
									frame_rate:
										argv["preset-config-media-screenshare-frame-rate"],
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
							can_edit_meeting_title:
								argv["permissions-can-edit-meeting-title"],
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
									can_produce:
										argv["permissions-media-screenshare-can-produce"],
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
										argv["ui-design-tokens-colors-warning"] as
											| string
											| undefined,
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
		),
});

export default command;
