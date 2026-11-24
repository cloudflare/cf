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
			command: "stream videos direct-upload create",
			classification: {
				safeFlags: ["encoding-mode", "require-signed-urls", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["upload-creator"] !== undefined)
				headers["Upload-Creator"] = String(argv["upload-creator"]);
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["max-duration-seconds"] === undefined) {
					throw new Error(
						"--max-duration-seconds is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
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
							: compactBody(
									{
										allowedOrigins: argv["allowed-origins"],
										creator: resolveFileToken(
											argv["creator"] as string | undefined,
											"creator",
											"text"
										),
										encodingMode: argv["encoding-mode"],
										expiry: resolveFileToken(
											argv["expiry"] as string | undefined,
											"expiry",
											"text"
										),
										maxDurationSeconds: argv["max-duration-seconds"],
										meta: parseJsonMap(argv["meta"], "meta"),
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
			await resolveRequiredFields();

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
			if (argv["meta"] !== undefined)
				setNestedValue(bodyData, ["meta"], parseJsonMap(argv["meta"], "meta"));
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
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
