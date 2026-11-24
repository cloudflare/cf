import operation from "../../_operations/stream/videos/clip.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./clip.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
