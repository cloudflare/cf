import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/stream.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 stream videos direct-upload create\n\nCreates a direct upload endpoint that allows an end-user to upload a video without an API key."
		)
		.option("upload-creator", {
			type: "string",
			description: "A user-defined identifier for the media creator.",
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
		.option("expiry", {
			type: "string",
			description:
				"The date and time after upload when videos will not be accepted.",
			default: "Now + 30 minutes",
		})
		.option("max-duration-seconds", {
			type: "number",
			description:
				"The maximum duration in seconds for a video upload. Can be set for a video that is not yet uploaded to limit its duration. Uploads that exceed the specified duration will fail during processing. A value of `-1` means the value is unknown.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Upload videos via direct upload URLs",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos direct-upload create",
				classification: {
					safeFlags: ["require-signed-urls", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["upload-creator"] !== undefined)
					headers["Upload-Creator"] = String(argv["upload-creator"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos direct-upload create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/direct_upload`,
						pathParams: {},
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
										expiry: resolveFileToken(
											argv["expiry"] as string | undefined,
											"expiry",
											"text"
										),
										maxDurationSeconds: argv["max-duration-seconds"],
										requireSignedURLs: argv["require-signed-urls"],
										scheduledDeletion: resolveFileToken(
											argv["scheduled-deletion"] as string | undefined,
											"scheduled-deletion",
											"text"
										),
										thumbnailTimestampPct: argv["thumbnail-timestamp-pct"],
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
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/stream/direct_upload`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["max-duration-seconds"] === undefined) {
					throw new Error(
						"--max-duration-seconds is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["allowed-origins"] !== undefined)
					setNestedValue(bodyData, ["allowedOrigins"], argv["allowed-origins"]);
				if (argv["creator"] !== undefined)
					setNestedValue(
						bodyData,
						["creator"],
						resolveFileToken(
							argv["creator"] as string | undefined,
							"creator",
							"text"
						)
					);
				if (argv["expiry"] !== undefined)
					setNestedValue(
						bodyData,
						["expiry"],
						resolveFileToken(
							argv["expiry"] as string | undefined,
							"expiry",
							"text"
						)
					);
				if (argv["max-duration-seconds"] !== undefined)
					setNestedValue(
						bodyData,
						["maxDurationSeconds"],
						argv["max-duration-seconds"]
					);
				if (argv["require-signed-urls"] !== undefined)
					setNestedValue(
						bodyData,
						["requireSignedURLs"],
						argv["require-signed-urls"]
					);
				if (argv["scheduled-deletion"] !== undefined)
					setNestedValue(
						bodyData,
						["scheduledDeletion"],
						resolveFileToken(
							argv["scheduled-deletion"] as string | undefined,
							"scheduled-deletion",
							"text"
						)
					);
				if (argv["thumbnail-timestamp-pct"] !== undefined)
					setNestedValue(
						bodyData,
						["thumbnailTimestampPct"],
						argv["thumbnail-timestamp-pct"]
					);
				if (argv["watermark-uid"] !== undefined)
					setNestedValue(
						bodyData,
						["watermark", "uid"],
						resolveFileToken(
							argv["watermark-uid"] as string | undefined,
							"watermark-uid",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/stream/direct_upload`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
