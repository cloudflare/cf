import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 realtime kit presets create <app-id>\n\nCreates a preset belonging to the current App"
		)
		.positional("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("config-livestream-viewer-qualities", {
			type: "string",
			array: true,
			description: "Livestream viewer quality levels.",
		})
		.option("config-max-screenshare-count", {
			type: "number",
			description:
				"Maximum number of screen shares that can be active at a given time",
		})
		.option("config-max-video-streams-desktop", {
			type: "number",
			description: "Maximum number of video streams visible on desktop devices",
		})
		.option("config-max-video-streams-mobile", {
			type: "number",
			description: "Maximum number of streams visible on mobile devices",
		})
		.option("config-media-audio-enable-high-bitrate", {
			type: "boolean",
			description: "Enable High Quality Audio for your meetings",
		})
		.option("config-media-audio-enable-stereo", {
			type: "boolean",
			description: "Enable Stereo for your meetings",
		})
		.option("config-media-screenshare-frame-rate", {
			type: "number",
			description: "Frame rate of screen share",
		})
		.option("config-media-screenshare-quality", {
			type: "string",
			description: "Quality of screen share ",
			choices: ["hd", "vga", "qvga", "fhd", "uhd"],
		})
		.coerce("config-media-screenshare-quality", (value) =>
			resolveFileToken(value, "config-media-screenshare-quality", "text")
		)
		.option("config-media-video-frame-rate", {
			type: "number",
			description: "Frame rate of participants' video",
		})
		.option("config-media-video-quality", {
			type: "string",
			description: "Video quality of participants",
			choices: ["hd", "vga", "qvga", "fhd", "uhd"],
		})
		.coerce("config-media-video-quality", (value) =>
			resolveFileToken(value, "config-media-video-quality", "text")
		)
		.option("config-media-video-simulcast", {
			type: "boolean",
			description: "Enable simulcast for participant videos.",
			default: false,
		})
		.option("config-view-type", {
			type: "string",
			description: "Type of the meeting",
			choices: ["GROUP_CALL", "WEBINAR", "AUDIO_ROOM", "LIVESTREAM"],
		})
		.coerce("config-view-type", (value) =>
			resolveFileToken(value, "config-view-type", "text")
		)
		.option("name", { type: "string", description: "Name of the preset" })
		.option("permissions-accept-stage-requests", {
			type: "boolean",
			description: "The permissions.accept_stage_requests field",
		})
		.option("permissions-accept-waiting-requests", {
			type: "boolean",
			description: "Whether this participant can accept waiting requests",
		})
		.option("permissions-can-accept-production-requests", {
			type: "boolean",
			description: "The permissions.can_accept_production_requests field",
		})
		.option("permissions-can-change-participant-permissions", {
			type: "boolean",
			description: "The permissions.can_change_participant_permissions field",
		})
		.option("permissions-can-edit-display-name", {
			type: "boolean",
			description: "The permissions.can_edit_display_name field",
		})
		.option("permissions-can-livestream", {
			type: "boolean",
			description: "The permissions.can_livestream field",
		})
		.option("permissions-can-record", {
			type: "boolean",
			description: "The permissions.can_record field",
		})
		.option("permissions-can-spotlight", {
			type: "boolean",
			description: "The permissions.can_spotlight field",
		})
		.option("permissions-chat-private-can-receive", {
			type: "boolean",
			description: "The permissions.chat.private.can_receive field",
		})
		.option("permissions-chat-private-can-send", {
			type: "boolean",
			description: "The permissions.chat.private.can_send field",
		})
		.option("permissions-chat-private-files", {
			type: "boolean",
			description: "The permissions.chat.private.files field",
		})
		.option("permissions-chat-private-text", {
			type: "boolean",
			description: "The permissions.chat.private.text field",
		})
		.option("permissions-chat-public-can-send", {
			type: "boolean",
			description: "Can send messages in general",
		})
		.option("permissions-chat-public-files", {
			type: "boolean",
			description: "Can send file messages",
		})
		.option("permissions-chat-public-text", {
			type: "boolean",
			description: "Can send text messages",
		})
		.option("permissions-connected-meetings-can-alter-connected-meetings", {
			type: "boolean",
			description:
				"The permissions.connected_meetings.can_alter_connected_meetings field",
		})
		.option("permissions-connected-meetings-can-switch-connected-meetings", {
			type: "boolean",
			description:
				"The permissions.connected_meetings.can_switch_connected_meetings field",
		})
		.option("permissions-connected-meetings-can-switch-to-parent-meeting", {
			type: "boolean",
			description:
				"The permissions.connected_meetings.can_switch_to_parent_meeting field",
		})
		.option("permissions-disable-participant-audio", {
			type: "boolean",
			description: "The permissions.disable_participant_audio field",
		})
		.option("permissions-disable-participant-screensharing", {
			type: "boolean",
			description: "The permissions.disable_participant_screensharing field",
		})
		.option("permissions-disable-participant-video", {
			type: "boolean",
			description: "The permissions.disable_participant_video field",
		})
		.option("permissions-hidden-participant", {
			type: "boolean",
			description: "Whether this participant is visible to others or not",
		})
		.option("permissions-is-recorder", {
			type: "boolean",
			description: "The permissions.is_recorder field",
		})
		.option("permissions-kick-participant", {
			type: "boolean",
			description: "The permissions.kick_participant field",
		})
		.option("permissions-media-audio-can-produce", {
			type: "string",
			description: "Can produce audio",
			choices: ["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"],
		})
		.coerce("permissions-media-audio-can-produce", (value) =>
			resolveFileToken(value, "permissions-media-audio-can-produce", "text")
		)
		.option("permissions-media-screenshare-can-produce", {
			type: "string",
			description: "Can produce screen share video",
			choices: ["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"],
		})
		.coerce("permissions-media-screenshare-can-produce", (value) =>
			resolveFileToken(
				value,
				"permissions-media-screenshare-can-produce",
				"text"
			)
		)
		.option("permissions-media-video-can-produce", {
			type: "string",
			description: "Can produce video",
			choices: ["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"],
		})
		.coerce("permissions-media-video-can-produce", (value) =>
			resolveFileToken(value, "permissions-media-video-can-produce", "text")
		)
		.option("permissions-pin-participant", {
			type: "boolean",
			description: "The permissions.pin_participant field",
		})
		.option("permissions-plugins-can-close", {
			type: "boolean",
			description: "Can close plugins that are already open",
		})
		.option("permissions-plugins-can-edit-config", {
			type: "boolean",
			description: "Can edit plugin config",
		})
		.option("permissions-plugins-can-start", {
			type: "boolean",
			description: "Can start plugins",
		})
		.option("permissions-polls-can-create", {
			type: "boolean",
			description: "Can create polls",
		})
		.option("permissions-polls-can-view", {
			type: "boolean",
			description: "Can view polls",
		})
		.option("permissions-polls-can-vote", {
			type: "boolean",
			description: "Can vote on polls",
		})
		.option("permissions-recorder-type", {
			type: "string",
			description: "Type of the recording peer",
			choices: ["RECORDER", "LIVESTREAMER", "NONE"],
		})
		.coerce("permissions-recorder-type", (value) =>
			resolveFileToken(value, "permissions-recorder-type", "text")
		)
		.option("permissions-show-participant-list", {
			type: "boolean",
			description: "The permissions.show_participant_list field",
		})
		.option("permissions-stage-access", {
			type: "string",
			description: "The permissions.stage_access field",
			choices: ["ALLOWED", "NOT_ALLOWED", "CAN_REQUEST"],
		})
		.coerce("permissions-stage-access", (value) =>
			resolveFileToken(value, "permissions-stage-access", "text")
		)
		.option("permissions-stage-enabled", {
			type: "boolean",
			description: "The permissions.stage_enabled field",
		})
		.option("permissions-transcription-enabled", {
			type: "boolean",
			description: "The permissions.transcription_enabled field",
		})
		.option("permissions-waiting-room-type", {
			type: "string",
			description: "Waiting room type",
			choices: ["SKIP", "ON_PRIVILEGED_USER_ENTRY", "SKIP_ON_ACCEPT"],
		})
		.coerce("permissions-waiting-room-type", (value) =>
			resolveFileToken(value, "permissions-waiting-room-type", "text")
		)
		.option("ui-design-tokens-border-radius", {
			type: "string",
			description: "The ui.design_tokens.border_radius field",
			choices: ["sharp", "rounded", "extra-rounded", "circular"],
		})
		.coerce("ui-design-tokens-border-radius", (value) =>
			resolveFileToken(value, "ui-design-tokens-border-radius", "text")
		)
		.option("ui-design-tokens-border-width", {
			type: "string",
			description: "The ui.design_tokens.border_width field",
			choices: ["none", "thin", "fat"],
		})
		.coerce("ui-design-tokens-border-width", (value) =>
			resolveFileToken(value, "ui-design-tokens-border-width", "text")
		)
		.option("ui-design-tokens-colors-danger", {
			type: "string",
			description: "The ui.design_tokens.colors.danger field",
		})
		.option("ui-design-tokens-colors-success", {
			type: "string",
			description: "The ui.design_tokens.colors.success field",
		})
		.option("ui-design-tokens-colors-text", {
			type: "string",
			description: "The ui.design_tokens.colors.text field",
		})
		.option("ui-design-tokens-colors-text-on-brand", {
			type: "string",
			description: "The ui.design_tokens.colors.text_on_brand field",
		})
		.option("ui-design-tokens-colors-video-bg", {
			type: "string",
			description: "The ui.design_tokens.colors.video_bg field",
		})
		.option("ui-design-tokens-colors-warning", {
			type: "string",
			description: "The ui.design_tokens.colors.warning field",
		})
		.option("ui-design-tokens-font-family", {
			type: "string",
			description: "The ui.design_tokens.font_family field",
		})
		.option("ui-design-tokens-google-font", {
			type: "string",
			description: "The ui.design_tokens.google_font field",
		})
		.option("ui-design-tokens-logo", {
			type: "string",
			description: "The ui.design_tokens.logo field",
		})
		.option("ui-design-tokens-spacing-base", {
			type: "number",
			description: "The ui.design_tokens.spacing_base field",
		})
		.option("ui-design-tokens-theme", {
			type: "string",
			description: "The ui.design_tokens.theme field",
			choices: ["darkest", "dark", "light"],
		})
		.coerce("ui-design-tokens-theme", (value) =>
			resolveFileToken(value, "ui-design-tokens-theme", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"post-presets">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <app-id>",
	describe: "Create a preset",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit presets create",
				classification: {
					safeFlags: [
						"config-media-audio-enable-high-bitrate",
						"config-media-audio-enable-stereo",
						"config-media-screenshare-quality",
						"config-media-video-quality",
						"config-media-video-simulcast",
						"config-view-type",
						"permissions-accept-stage-requests",
						"permissions-accept-waiting-requests",
						"permissions-can-accept-production-requests",
						"permissions-can-change-participant-permissions",
						"permissions-can-edit-display-name",
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit presets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/presets`,
						pathParams: { "app-id": String(argv["app-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											livestream_viewer_qualities:
												argv["config-livestream-viewer-qualities"],
											max_screenshare_count:
												argv["config-max-screenshare-count"],
											max_video_streams: {
												desktop: argv["config-max-video-streams-desktop"],
												mobile: argv["config-max-video-streams-mobile"],
											},
											media: {
												audio: {
													enable_high_bitrate:
														argv["config-media-audio-enable-high-bitrate"],
													enable_stereo:
														argv["config-media-audio-enable-stereo"],
												},
												screenshare: {
													frame_rate:
														argv["config-media-screenshare-frame-rate"],
													quality: argv["config-media-screenshare-quality"],
												},
												video: {
													frame_rate: argv["config-media-video-frame-rate"],
													quality: argv["config-media-video-quality"],
													simulcast: argv["config-media-video-simulcast"],
												},
											},
											view_type: argv["config-view-type"],
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.realtime.kit.presets.create({
							body: bodyData,
							account_id: accountId,
							app_id: argv["app-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["config-max-screenshare-count"] === undefined) {
					throw new Error(
						"--config-max-screenshare-count is required (or pass --body with this field set)."
					);
				}
				if (argv["config-max-video-streams-desktop"] === undefined) {
					throw new Error(
						"--config-max-video-streams-desktop is required (or pass --body with this field set)."
					);
				}
				if (argv["config-max-video-streams-mobile"] === undefined) {
					throw new Error(
						"--config-max-video-streams-mobile is required (or pass --body with this field set)."
					);
				}
				if (argv["config-media-screenshare-frame-rate"] === undefined) {
					throw new Error(
						"--config-media-screenshare-frame-rate is required (or pass --body with this field set)."
					);
				}
				if (argv["config-media-screenshare-quality"] === undefined) {
					argv["config-media-screenshare-quality"] =
						await promptForRequiredEnumField(
							"config-media-screenshare-quality",
							"Quality of screen share ",
							["hd", "vga", "qvga", "fhd", "uhd"] as const
						);
				}
				if (argv["config-media-video-frame-rate"] === undefined) {
					throw new Error(
						"--config-media-video-frame-rate is required (or pass --body with this field set)."
					);
				}
				if (argv["config-media-video-quality"] === undefined) {
					argv["config-media-video-quality"] = await promptForRequiredEnumField(
						"config-media-video-quality",
						"Video quality of participants",
						["hd", "vga", "qvga", "fhd", "uhd"] as const
					);
				}
				if (argv["config-view-type"] === undefined) {
					argv["config-view-type"] = await promptForRequiredEnumField(
						"config-view-type",
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					config: {
						livestream_viewer_qualities:
							argv["config-livestream-viewer-qualities"],
						max_screenshare_count: argv["config-max-screenshare-count"],
						max_video_streams: {
							desktop: argv["config-max-video-streams-desktop"],
							mobile: argv["config-max-video-streams-mobile"],
						},
						media: {
							audio: {
								enable_high_bitrate:
									argv["config-media-audio-enable-high-bitrate"],
								enable_stereo: argv["config-media-audio-enable-stereo"],
							},
							screenshare: {
								frame_rate: argv["config-media-screenshare-frame-rate"],
								quality: argv["config-media-screenshare-quality"],
							},
							video: {
								frame_rate: argv["config-media-video-frame-rate"],
								quality: argv["config-media-video-quality"],
								simulcast: argv["config-media-video-simulcast"],
							},
						},
						view_type: argv["config-view-type"],
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.realtime.kit.presets.create({
						body: bodyData,
						account_id: accountId,
						app_id: argv["app-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
