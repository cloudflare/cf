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
			"$0 realtime kit recordings tracks start <app-id>\n\nStarts track recording for a meeting. Track recording currently records separate participant audio tracks as WebM files in the RealtimeKit bucket. Video track recording is in development. For more information, refer to [Track recording](/realtime/realtimekit/recording-guide/track-recording/)."
		)
		.positional("app-id", {
			type: "string",
			description: "The app identifier tag.",
			demandOption: true,
		})
		.option("meeting-id", {
			type: "string",
			description: "ID of the meeting to record.",
		})
		.option("user-ids", {
			type: "string",
			array: true,
			description:
				"Optional list of participant user IDs to record. Selective track recording (`user_ids`) is in early beta contact support to use this feature.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Starts audio track recording for an active meeting. Use \`layers\` only when you need to set a file name prefix. Selective track recording (\`user_ids\`) is in early beta contact support to use this feature.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"startTrackRecordingForAMeeting">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "start <app-id>",
	describe: "Start recording participant audio tracks",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit recordings tracks start",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf realtime kit recordings tracks start",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/recordings/track`,
						pathParams: { "app-id": String(argv["app-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										meeting_id: resolveFileToken(
											argv["meeting-id"] as string | undefined,
											"meeting-id",
											"text"
										),
										user_ids: argv["user-ids"],
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
						client.realtime.kit.recordings.tracks.start({
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
					meeting_id: resolveFileToken(
						argv["meeting-id"] as string | undefined,
						"meeting-id",
						"text"
					),
					user_ids: argv["user-ids"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.realtime.kit.recordings.tracks.start({
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
