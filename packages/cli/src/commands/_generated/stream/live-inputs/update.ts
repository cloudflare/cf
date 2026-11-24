import operation from "../../_operations/stream/live-inputs/update.js";
/**
 * update command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <live-input-identifier>",
	describe: "Update a live input",
	usage:
		"$0 stream live-inputs update <live-input-identifier>\n\nUpdates a specified live input.",
	flags: {
		"default-creator": {
			kind: "parsed",
			brief: "Sets the creator ID asssociated with this live input.",
			optional: true,
			parse: String,
		},
		"delete-recording-after-days": {
			kind: "parsed",
			brief:
				"Indicates the number of days after which the live inputs recordings will be deleted. When a stream completes and the recording is ready, the value is used to calculate a scheduled deletion date for that recording. Omit the field to indicate no change, or include with a `null` value to remove an existing scheduled deletion.",
			optional: true,
			parse: Number,
		},
		enabled: {
			kind: "boolean",
			brief:
				"Indicates whether the live input is enabled and can accept streams.",
			optional: true,
		},
		meta: {
			kind: "parsed",
			brief:
				'A user modifiable key-value store used to reference other systems of record for managing live inputs. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"prefer-low-latency": {
			kind: "boolean",
			brief:
				"When enabled, the live stream is delivered using Low-Latency HLS (LL-HLS), reducing glass-to-glass latency for viewers at the cost of reduced player compatibility.",
			optional: true,
		},
		"recording-allowed-origins": {
			kind: "parsed",
			brief:
				"Lists the origins allowed to display videos created with this input. Enter allowed origin domains in an array and use `*` for wildcard subdomains. An empty array allows videos to be viewed on any origin.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"recording-hide-live-viewer-count": {
			kind: "boolean",
			brief:
				"Disables reporting the number of live viewers when this property is set to `true`.",
			optional: true,
		},
		"recording-mode": {
			kind: "parsed",
			brief:
				"Specifies the recording behavior for the live input. Set this value to `off` to prevent a recording. Set the value to `automatic` to begin a recording and transition to on-demand after Stream Live stops receiving input.",
			optional: true,
			choices: ["off", "automatic"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "recording-mode", "text"),
		},
		"recording-require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates if a video using the live input has the `requireSignedURLs` property set. Also enforces access controls on any video recording of the livestream with the live input.",
			optional: true,
		},
		"recording-timeout-seconds": {
			kind: "parsed",
			brief:
				"Determines the amount of time a live input configured in `automatic` mode should wait before a recording transitions from live to on-demand. `0` is recommended for most use cases and indicates the platform default should be used.",
			optional: true,
			parse: Number,
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
			placeholder: "live-input-identifier",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream live-inputs update",
				classification: {
					safeFlags: [
						"enabled",
						"prefer-low-latency",
						"recording-hide-live-viewer-count",
						"recording-mode",
						"recording-require-signed-urls",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream live-inputs update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/live_inputs/${argv["live-input-identifier"] == null ? "<live-input-identifier>" : encodeURIComponent(String(argv["live-input-identifier"]))}`,
						pathParams: {
							"live-input-identifier": String(
								argv["live-input-identifier"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											defaultCreator: resolveFileToken(
												argv["default-creator"] as string | undefined,
												"default-creator",
												"text"
											),
											deleteRecordingAfterDays:
												argv["delete-recording-after-days"],
											enabled: argv["enabled"],
											meta: parseJsonMap(argv["meta"], "meta"),
											preferLowLatency: argv["prefer-low-latency"],
											recording: {
												allowedOrigins: argv["recording-allowed-origins"],
												hideLiveViewerCount:
													argv["recording-hide-live-viewer-count"],
												mode: argv["recording-mode"],
												requireSignedURLs:
													argv["recording-require-signed-urls"],
												timeoutSeconds: argv["recording-timeout-seconds"],
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							live_input_identifier: argv["live-input-identifier"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						defaultCreator: resolveFileToken(
							argv["default-creator"] as string | undefined,
							"default-creator",
							"text"
						),
						deleteRecordingAfterDays: argv["delete-recording-after-days"],
						enabled: argv["enabled"],
						meta: parseJsonMap(argv["meta"], "meta"),
						preferLowLatency: argv["prefer-low-latency"],
						recording: {
							allowedOrigins: argv["recording-allowed-origins"],
							hideLiveViewerCount: argv["recording-hide-live-viewer-count"],
							mode: argv["recording-mode"],
							requireSignedURLs: argv["recording-require-signed-urls"],
							timeoutSeconds: argv["recording-timeout-seconds"],
						},
					},
					[["meta"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						live_input_identifier: argv["live-input-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
