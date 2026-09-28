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
			"$0 stream videos edit <identifier>\n\nEdit details for a single video."
		)
		.positional("identifier", {
			type: "string",
			description: "A Cloudflare-generated unique identifier for a media item.",
			demandOption: true,
		})
		.option("allowed-origins", {
			type: "string",
			array: true,
			description:
				"Lists the origins allowed to display the video. Enter allowed origin domains in an array and use `*` for wildcard subdomains. Empty arrays allow the video to be viewed on any origin.",
		})
		.option("creator", {
			type: "string",
			description: "A user-defined identifier for the media creator.",
		})
		.option("max-duration-seconds", {
			type: "number",
			description:
				"The maximum duration in seconds for a video upload. Can be set for a video that is not yet uploaded to limit its duration. Uploads that exceed the specified duration will fail during processing. A value of `-1` means the value is unknown.",
		})
		.option("public-details-channel-link", {
			type: "string",
			description: "The publicDetails.channel_link field",
		})
		.option("public-details-logo", {
			type: "string",
			description: "The publicDetails.logo field",
		})
		.option("public-details-share-link", {
			type: "string",
			description: "The publicDetails.share_link field",
		})
		.option("public-details-title", {
			type: "string",
			description: "The publicDetails.title field",
		})
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
		.option("thumbnail-timestamp-pct", {
			type: "number",
			description:
				"The timestamp for a thumbnail image calculated as a percentage value of the video's duration. To convert from a second-wise timestamp to a percentage, divide the desired timestamp by the total duration of the video.  If this value is not set, the default thumbnail image is taken from 0s of the video.",
			default: 0,
		})
		.option("uid", {
			type: "string",
			description:
				"The unique identifier for the video. Can be used to verify the video being updated.",
		})
		.option("upload-expiry", {
			type: "string",
			description:
				"The date and time when the video upload URL is no longer valid for direct user uploads.",
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

type Request = SdkRequest<"stream-videos-update-video-details">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <identifier>",
	describe: "Edit video details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos edit",
				classification: {
					safeFlags: ["require-signed-urls", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos edit",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}`,
						pathParams: { identifier: String(argv["identifier"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allowedOrigins: argv["allowed-origins"],
										creator: resolveFileToken(
											argv["creator"] as string | undefined,
											"creator",
											"text"
										),
										maxDurationSeconds: argv["max-duration-seconds"],
										publicDetails: {
											channel_link: resolveFileToken(
												argv["public-details-channel-link"] as
													| string
													| undefined,
												"public-details-channel-link",
												"text"
											),
											logo: resolveFileToken(
												argv["public-details-logo"] as string | undefined,
												"public-details-logo",
												"text"
											),
											share_link: resolveFileToken(
												argv["public-details-share-link"] as string | undefined,
												"public-details-share-link",
												"text"
											),
											title: resolveFileToken(
												argv["public-details-title"] as string | undefined,
												"public-details-title",
												"text"
											),
										},
										requireSignedURLs: argv["require-signed-urls"],
										scheduledDeletion: resolveFileToken(
											argv["scheduled-deletion"] as string | undefined,
											"scheduled-deletion",
											"text"
										),
										thumbnailTimestampPct: argv["thumbnail-timestamp-pct"],
										uid: resolveFileToken(
											argv["uid"] as string | undefined,
											"uid",
											"text"
										),
										uploadExpiry: resolveFileToken(
											argv["upload-expiry"] as string | undefined,
											"upload-expiry",
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
					const result = await withProgress(`Creating`, async () =>
						client.stream.videos.edit({
							...bodyData,
							account_id: accountId,
							identifier: argv["identifier"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					allowedOrigins: argv["allowed-origins"],
					creator: resolveFileToken(
						argv["creator"] as string | undefined,
						"creator",
						"text"
					),
					maxDurationSeconds: argv["max-duration-seconds"],
					publicDetails: {
						channel_link: resolveFileToken(
							argv["public-details-channel-link"] as string | undefined,
							"public-details-channel-link",
							"text"
						),
						logo: resolveFileToken(
							argv["public-details-logo"] as string | undefined,
							"public-details-logo",
							"text"
						),
						share_link: resolveFileToken(
							argv["public-details-share-link"] as string | undefined,
							"public-details-share-link",
							"text"
						),
						title: resolveFileToken(
							argv["public-details-title"] as string | undefined,
							"public-details-title",
							"text"
						),
					},
					requireSignedURLs: argv["require-signed-urls"],
					scheduledDeletion: resolveFileToken(
						argv["scheduled-deletion"] as string | undefined,
						"scheduled-deletion",
						"text"
					),
					thumbnailTimestampPct: argv["thumbnail-timestamp-pct"],
					uid: resolveFileToken(
						argv["uid"] as string | undefined,
						"uid",
						"text"
					),
					uploadExpiry: resolveFileToken(
						argv["upload-expiry"] as string | undefined,
						"upload-expiry",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.stream.videos.edit({
						...bodyData,
						account_id: accountId,
						identifier: argv["identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
