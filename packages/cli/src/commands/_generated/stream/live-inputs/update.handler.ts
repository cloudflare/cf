import operation from "../../_operations/stream/live-inputs/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
											requireSignedURLs: argv["recording-require-signed-urls"],
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
	);
}
