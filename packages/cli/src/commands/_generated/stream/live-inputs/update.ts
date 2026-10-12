import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
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
			"$0 stream live-inputs update <live-input-identifier>\n\nUpdates a specified live input."
		)
		.positional("live-input-identifier", {
			type: "string",
			description: "A unique identifier for a live input.",
			demandOption: true,
		})
		.option("default-creator", {
			type: "string",
			description: "Sets the creator ID asssociated with this live input.",
		})
		.option("delete-recording-after-days", {
			type: "number",
			description:
				"Indicates the number of days after which the live inputs recordings will be deleted. When a stream completes and the recording is ready, the value is used to calculate a scheduled deletion date for that recording. Omit the field to indicate no change, or include with a `null` value to remove an existing scheduled deletion.",
		})
		.option("enabled", {
			type: "boolean",
			description:
				"Indicates whether the live input is enabled and can accept streams.",
		})
		.option("prefer-low-latency", {
			type: "boolean",
			description:
				"When enabled, the live stream is delivered using Low-Latency HLS (LL-HLS), reducing glass-to-glass latency for viewers at the cost of reduced player compatibility.",
		})
		.option("recording-allowed-origins", {
			type: "string",
			array: true,
			description:
				"Lists the origins allowed to display videos created with this input. Enter allowed origin domains in an array and use `*` for wildcard subdomains. An empty array allows videos to be viewed on any origin.",
		})
		.option("recording-hide-live-viewer-count", {
			type: "boolean",
			description:
				"Disables reporting the number of live viewers when this property is set to `true`.",
		})
		.option("recording-mode", {
			type: "string",
			description:
				"Specifies the recording behavior for the live input. Set this value to `off` to prevent a recording. Set the value to `automatic` to begin a recording and transition to on-demand after Stream Live stops receiving input.",
			choices: ["off", "automatic"],
		})
		.coerce("recording-mode", (value) =>
			resolveFileToken(value, "recording-mode", "text")
		)
		.option("recording-require-signed-urls", {
			type: "boolean",
			description:
				"Indicates if a video using the live input has the `requireSignedURLs` property set. Also enforces access controls on any video recording of the livestream with the live input.",
		})
		.option("recording-timeout-seconds", {
			type: "number",
			description:
				"Determines the amount of time a live input configured in `automatic` mode should wait before a recording transitions from live to on-demand. `0` is recommended for most use cases and indicates the platform default should be used.",
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

type Request = SdkRequest<"stream-live-inputs-update-a-live-input">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <live-input-identifier>",
	describe: "Update a live input",
	builder,
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
				} satisfies ArgClassification<Args>,
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
								: compactBody({
										defaultCreator: resolveFileToken(
											argv["default-creator"] as string | undefined,
											"default-creator",
											"text"
										),
										deleteRecordingAfterDays:
											argv["delete-recording-after-days"],
										enabled: argv["enabled"],
										preferLowLatency: argv["prefer-low-latency"],
										recording: {
											allowedOrigins: argv["recording-allowed-origins"],
											hideLiveViewerCount:
												argv["recording-hide-live-viewer-count"],
											mode: argv["recording-mode"],
											requireSignedURLs: argv["recording-require-signed-urls"],
											timeoutSeconds: argv["recording-timeout-seconds"],
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
					const result = await withProgress(`Updating`, async () =>
						client.stream.liveInputs.update({
							...bodyData,
							account_id: accountId,
							live_input_identifier: argv["live-input-identifier"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					defaultCreator: resolveFileToken(
						argv["default-creator"] as string | undefined,
						"default-creator",
						"text"
					),
					deleteRecordingAfterDays: argv["delete-recording-after-days"],
					enabled: argv["enabled"],
					preferLowLatency: argv["prefer-low-latency"],
					recording: {
						allowedOrigins: argv["recording-allowed-origins"],
						hideLiveViewerCount: argv["recording-hide-live-viewer-count"],
						mode: argv["recording-mode"],
						requireSignedURLs: argv["recording-require-signed-urls"],
						timeoutSeconds: argv["recording-timeout-seconds"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.stream.liveInputs.update({
						...bodyData,
						account_id: accountId,
						live_input_identifier: argv["live-input-identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
