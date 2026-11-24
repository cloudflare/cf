import operation from "../../_operations/stream/videos/clip.js";
/**
 * clip command
 * @generated from apis/overlays/stream.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "clip",
	describe: "Clip videos given a start and end time",
	usage:
		"$0 stream videos clip\n\nClips a video based on the specified start and end times provided in seconds.",
	flags: {
		"allowed-origins": {
			kind: "parsed",
			brief:
				"Lists the origins allowed to display the video. Enter allowed origin domains in an array and use `*` for wildcard subdomains. Empty arrays allow the video to be viewed on any origin.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"clipped-from-video-uid": {
			kind: "parsed",
			brief: "The unique video identifier (UID).",
			optional: true,
			parse: String,
		},
		creator: {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		"end-time-seconds": {
			kind: "parsed",
			brief: "Specifies the end time for the video clip in seconds.",
			optional: true,
			parse: Number,
		},
		input: {
			kind: "parsed",
			brief: "A video's URL. Preferred over 'url'.",
			optional: true,
			parse: String,
		},
		meta: {
			kind: "parsed",
			brief:
				'A user modifiable key-value store used to reference other systems of record for managing videos. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A name for the video.",
			optional: true,
			parse: String,
		},
		"require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates whether the video can be a accessed using the UID. When set to `true`, a signed token must be generated with a signing key to view the video.",
			default: false,
		},
		"scheduled-deletion": {
			kind: "parsed",
			brief:
				"Indicates the date and time at which the video will be deleted. Omit the field to indicate no change, or include with a `null` value to remove an existing scheduled deletion. If specified, must be at least 30 days from upload time.",
			optional: true,
			parse: String,
		},
		"start-time-seconds": {
			kind: "parsed",
			brief: "Specifies the start time for the video clip in seconds.",
			optional: true,
			parse: Number,
		},
		"thumbnail-timestamp-pct": {
			kind: "parsed",
			brief:
				"The timestamp for a thumbnail image calculated as a percentage value of the video's duration. To convert from a second-wise timestamp to a percentage, divide the desired timestamp by the total duration of the video.  If this value is not set, the default thumbnail image is taken from 0s of the video.",
			default: "0",
			parse: Number,
		},
		url: {
			kind: "parsed",
			brief: "A video's URL (legacy field, use 'input' instead).",
			optional: true,
			parse: String,
		},
		"watermark-uid": {
			kind: "parsed",
			brief: "The unique identifier for the watermark profile.",
			optional: true,
			parse: String,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos clip",
				classification: {
					safeFlags: ["require-signed-urls", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
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
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
								: compactBody(
										{
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
											meta: parseJsonMap(argv["meta"], "meta"),
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
										},
										[["meta"]]
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
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
						meta: parseJsonMap(argv["meta"], "meta"),
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
					},
					[["meta"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
