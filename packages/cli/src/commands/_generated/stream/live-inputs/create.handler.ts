import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "stream live-inputs create",
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
			const headers: Record<string, string> = {};
			if (argv["idempotency-key"] !== undefined)
				headers["Idempotency-Key"] = String(argv["idempotency-key"]);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf stream live-inputs create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/live_inputs`,
					pathParams: {},
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
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/stream/live_inputs`,
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
			if (argv["default-creator"] !== undefined)
				setNestedValue(
					bodyData,
					["defaultCreator"],
					resolveFileToken(
						argv["default-creator"] as string | undefined,
						"default-creator",
						"text"
					)
				);
			if (argv["delete-recording-after-days"] !== undefined)
				setNestedValue(
					bodyData,
					["deleteRecordingAfterDays"],
					argv["delete-recording-after-days"]
				);
			if (argv["enabled"] !== undefined)
				setNestedValue(bodyData, ["enabled"], argv["enabled"]);
			if (argv["meta"] !== undefined)
				setNestedValue(bodyData, ["meta"], parseJsonMap(argv["meta"], "meta"));
			if (argv["prefer-low-latency"] !== undefined)
				setNestedValue(
					bodyData,
					["preferLowLatency"],
					argv["prefer-low-latency"]
				);
			if (argv["recording-allowed-origins"] !== undefined)
				setNestedValue(
					bodyData,
					["recording", "allowedOrigins"],
					argv["recording-allowed-origins"]
				);
			if (argv["recording-hide-live-viewer-count"] !== undefined)
				setNestedValue(
					bodyData,
					["recording", "hideLiveViewerCount"],
					argv["recording-hide-live-viewer-count"]
				);
			if (argv["recording-mode"] !== undefined)
				setNestedValue(bodyData, ["recording", "mode"], argv["recording-mode"]);
			if (argv["recording-require-signed-urls"] !== undefined)
				setNestedValue(
					bodyData,
					["recording", "requireSignedURLs"],
					argv["recording-require-signed-urls"]
				);
			if (argv["recording-timeout-seconds"] !== undefined)
				setNestedValue(
					bodyData,
					["recording", "timeoutSeconds"],
					argv["recording-timeout-seconds"]
				);
			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/stream/live_inputs`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
