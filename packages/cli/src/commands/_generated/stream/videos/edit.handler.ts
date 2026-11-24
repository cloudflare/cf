import operation from "../../_operations/stream/videos/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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
			command: "stream videos edit",
			classification: {
				safeFlags: ["require-signed-urls", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
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
							: compactBody(
									{
										allowedOrigins: argv["allowed-origins"],
										creator: resolveFileToken(
											argv["creator"] as string | undefined,
											"creator",
											"text"
										),
										maxDurationSeconds: argv["max-duration-seconds"],
										meta: parseJsonMap(argv["meta"], "meta"),
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						identifier: argv["identifier"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					allowedOrigins: argv["allowed-origins"],
					creator: resolveFileToken(
						argv["creator"] as string | undefined,
						"creator",
						"text"
					),
					maxDurationSeconds: argv["max-duration-seconds"],
					meta: parseJsonMap(argv["meta"], "meta"),
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
				},
				[["meta"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					identifier: argv["identifier"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
