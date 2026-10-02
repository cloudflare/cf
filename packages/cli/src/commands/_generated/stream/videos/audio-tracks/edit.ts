import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/stream.ts
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
			"$0 stream videos audio-tracks edit <audio-identifier>\n\nEdits additional audio tracks on a video. Editing the default status of an audio track to `true` will mark all other audio tracks on the video default status to `false`."
		)
		.positional("audio-identifier", {
			type: "string",
			description: "The unique identifier for an additional audio track.",
			demandOption: true,
		})
		.option("identifier", {
			type: "string",
			description: "A Cloudflare-generated unique identifier for a media item.",
			demandOption: true,
		})
		.option("default", {
			type: "boolean",
			description:
				"Denotes whether the audio track will be played by default in a player.",
		})
		.option("label", {
			type: "string",
			description:
				"A string to uniquely identify the track amongst other audio track labels for the specified video.",
		})
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

type Request = SdkRequest<"edit-audio-tracks">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <audio-identifier>",
	describe: "Edit additional audio tracks on a video",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos audio-tracks edit",
				classification: {
					safeFlags: ["default", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos audio-tracks edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/audio/${argv["audio-identifier"] == null ? "<audio-identifier>" : encodeURIComponent(String(argv["audio-identifier"]))}`,
						pathParams: {
							identifier: String(argv["identifier"] ?? ""),
							"audio-identifier": String(argv["audio-identifier"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default: argv["default"],
										label: resolveFileToken(
											argv["label"] as string | undefined,
											"label",
											"text"
										),
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
						client.stream.videos.audioTracks.edit({
							...bodyData,
							account_id: accountId,
							identifier: argv["identifier"],
							audio_identifier: argv["audio-identifier"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					default: argv["default"],
					label: resolveFileToken(
						argv["label"] as string | undefined,
						"label",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.stream.videos.audioTracks.edit({
						...bodyData,
						account_id: accountId,
						identifier: argv["identifier"],
						audio_identifier: argv["audio-identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
