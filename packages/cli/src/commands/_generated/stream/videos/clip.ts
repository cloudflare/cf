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
 * clip command
 * @generated from apis/overlays/stream.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 stream videos clip\n\nClips a video based on the specified start and end times provided in seconds."
		)
		.option("allowed-origins", {
			type: "string",
			array: true,
			description:
				"Lists the origins allowed to display the video. Enter allowed origin domains in an array and use `*` for wildcard subdomains. Empty arrays allow the video to be viewed on any origin.",
		})
		.option("clipped-from-video-uid", {
			type: "string",
			description: "The unique video identifier (UID).",
		})
		.option("creator", {
			type: "string",
			description: "A user-defined identifier for the media creator.",
		})
		.option("end-time-seconds", {
			type: "number",
			description: "Specifies the end time for the video clip in seconds.",
		})
		.option("input", {
			type: "string",
			description: "A video's URL. Preferred over 'url'.",
		})
		.option("name", { type: "string", description: "A name for the video." })
		.option("require-signed-urls", {
			type: "boolean",
			description:
				"Indicates whether the video can be a accessed using the UID. When set to `true`, a signed token must be generated with a signing key to view the video.",
			default: false,
		})
		.option("scheduled-deletion", {
			type: "string",
			description:
				"Indicates the date and time at which the video will be deleted. Omit the field to indicate no change, or include with a `null` value to remove an existing scheduled deletion. If specified, must be at least 30 days from upload time.",
		})
		.option("start-time-seconds", {
			type: "number",
			description: "Specifies the start time for the video clip in seconds.",
		})
		.option("thumbnail-timestamp-pct", {
			type: "number",
			description:
				"The timestamp for a thumbnail image calculated as a percentage value of the video's duration. To convert from a second-wise timestamp to a percentage, divide the desired timestamp by the total duration of the video.  If this value is not set, the default thumbnail image is taken from 0s of the video.",
			default: 0,
		})
		.option("url", {
			type: "string",
			description: "A video's URL (legacy field, use 'input' instead).",
		})
		.option("watermark-uid", {
			type: "string",
			description: "The unique identifier for the watermark profile.",
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

type Request =
	SdkRequest<"stream-video-clipping-clip-videos-given-a-start-and-end-time">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "clip",
	describe: "Clip videos given a start and end time",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos clip",
				classification: {
					safeFlags: ["require-signed-urls", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos clip",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/clip`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allowedOrigins: argv["allowed-origins"],
										clippedFromVideoUID: resolveFileToken(
											argv["clipped-from-video-uid"] as string | undefined,
											"clipped-from-video-uid",
											"text"
										),
										creator: resolveFileToken(
											argv["creator"] as string | undefined,
											"creator",
											"text"
										),
										endTimeSeconds: argv["end-time-seconds"],
										input: resolveFileToken(
											argv["input"] as string | undefined,
											"input",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										requireSignedURLs: argv["require-signed-urls"],
										scheduledDeletion: resolveFileToken(
											argv["scheduled-deletion"] as string | undefined,
											"scheduled-deletion",
											"text"
										),
										startTimeSeconds: argv["start-time-seconds"],
										thumbnailTimestampPct: argv["thumbnail-timestamp-pct"],
										url: resolveFileToken(
											argv["url"] as string | undefined,
											"url",
											"text"
										),
										watermark: {
											uid: resolveFileToken(
												argv["watermark-uid"] as string | undefined,
												"watermark-uid",
												"text"
											),
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
						client.stream.videos.clip({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["clipped-from-video-uid"] === undefined) {
					argv["clipped-from-video-uid"] = await promptForRequiredField(
						"clipped-from-video-uid",
						"The unique video identifier (UID)."
					);
				}
				if (argv["end-time-seconds"] === undefined) {
					throw new Error(
						"--end-time-seconds is required (or pass --body with this field set)."
					);
				}
				if (argv["start-time-seconds"] === undefined) {
					throw new Error(
						"--start-time-seconds is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					allowedOrigins: argv["allowed-origins"],
					clippedFromVideoUID: resolveFileToken(
						argv["clipped-from-video-uid"] as string | undefined,
						"clipped-from-video-uid",
						"text"
					),
					creator: resolveFileToken(
						argv["creator"] as string | undefined,
						"creator",
						"text"
					),
					endTimeSeconds: argv["end-time-seconds"],
					input: resolveFileToken(
						argv["input"] as string | undefined,
						"input",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					requireSignedURLs: argv["require-signed-urls"],
					scheduledDeletion: resolveFileToken(
						argv["scheduled-deletion"] as string | undefined,
						"scheduled-deletion",
						"text"
					),
					startTimeSeconds: argv["start-time-seconds"],
					thumbnailTimestampPct: argv["thumbnail-timestamp-pct"],
					url: resolveFileToken(
						argv["url"] as string | undefined,
						"url",
						"text"
					),
					watermark: {
						uid: resolveFileToken(
							argv["watermark-uid"] as string | undefined,
							"watermark-uid",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.stream.videos.clip({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
