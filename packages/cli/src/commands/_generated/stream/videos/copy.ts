/**
 * copy command
 * @generated from apis/overlays/stream.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "copy",
	describe: "Upload videos from a URL",
	usage:
		"$0 stream videos copy\n\nUploads a video to Stream from a provided URL.",
	flags: {
		"upload-creator": {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		"allowed-origins": {
			kind: "parsed",
			brief:
				"Lists the origins allowed to display the video. Enter allowed origin domains in an array and use `*` for wildcard subdomains. Empty arrays allow the video to be viewed on any origin.",
			variadic: true,
			optional: true,
			parse: String,
		},
		creator: {
			kind: "parsed",
			brief: "A user-defined identifier for the media creator.",
			optional: true,
			parse: String,
		},
		"encoding-mode": {
			kind: "parsed",
			brief:
				"Specifies whether to generate a preview rendition before the standard encoding ladder. `default` generates only the standard encoding ladder. `previewFirst` generates a preview rendition first.",
			default: "default",
			choices: ["default", "previewFirst"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "encoding-mode", "text"),
		},
		input: {
			kind: "parsed",
			brief:
				"A video's URL. The server must be publicly routable and support `HTTP HEAD` requests and `HTTP GET` range requests. The server should respond to `HTTP HEAD` requests with a `content-range` header that includes the size of the file. This is the preferred field over `url`.",
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
			brief: "A video's name. Used for legacy compatibility.",
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
		"thumbnail-timestamp-pct": {
			kind: "parsed",
			brief:
				"The timestamp for a thumbnail image calculated as a percentage value of the video's duration. To convert from a second-wise timestamp to a percentage, divide the desired timestamp by the total duration of the video.  If this value is not set, the default thumbnail image is taken from 0s of the video.",
			default: "0",
			parse: Number,
		},
		url: {
			kind: "parsed",
			brief:
				"A video's URL. The server must be publicly routable and support `HTTP HEAD` requests and `HTTP GET` range requests. The server should respond to `HTTP HEAD` requests with a `content-range` header that includes the size of the file. This field is deprecated in favor of `input`.",
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
			brief:
				"Copy upload request. Provide `input` (preferred) or `url` (deprecated).",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos copy",
				classification: {
					safeFlags: ["encoding-mode", "require-signed-urls", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["upload-creator"] !== undefined)
					headers["Upload-Creator"] = String(argv["upload-creator"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos copy",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/copy`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											allowedOrigins: argv["allowed-origins"],
											creator: resolveFileToken(
												argv["creator"] as string | undefined,
												"creator",
												"text"
											),
											encodingMode: argv["encoding-mode"],
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
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/stream/copy`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
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
				if (argv["encoding-mode"] !== undefined)
					setNestedValue(bodyData, ["encodingMode"], argv["encoding-mode"]);
				if (argv["input"] !== undefined)
					setNestedValue(
						bodyData,
						["input"],
						resolveFileToken(
							argv["input"] as string | undefined,
							"input",
							"text"
						)
					);
				if (argv["meta"] !== undefined)
					setNestedValue(
						bodyData,
						["meta"],
						parseJsonMap(argv["meta"], "meta")
					);
				if (argv["name"] !== undefined)
					setNestedValue(
						bodyData,
						["name"],
						resolveFileToken(argv["name"] as string | undefined, "name", "text")
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
				if (argv["url"] !== undefined)
					setNestedValue(
						bodyData,
						["url"],
						resolveFileToken(argv["url"] as string | undefined, "url", "text")
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
						`/accounts/${accountId}/stream/copy`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
