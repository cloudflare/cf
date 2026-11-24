import operation from "../../../../_operations/zero-trust/dlp/profiles/predefined/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust dlp profiles predefined update",
			classification: {
				safeFlags: [
					"ai-context-enabled",
					"context-awareness-enabled",
					"context-awareness-skip-files",
					"ocr-enabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust dlp profiles predefined update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/profiles/predefined/${argv["profile-id"] == null ? "<profile-id>" : encodeURIComponent(String(argv["profile-id"]))}`,
					pathParams: { "profile-id": String(argv["profile-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									ai_context_enabled: argv["ai-context-enabled"],
									allowed_match_count: argv["allowed-match-count"],
									confidence_threshold: resolveFileToken(
										argv["confidence-threshold"] as string | undefined,
										"confidence-threshold",
										"text"
									),
									context_awareness: {
										enabled: argv["context-awareness-enabled"],
										skip: {
											files: argv["context-awareness-skip-files"],
										},
									},
									entries: parseObjectArray(argv["entries"], "entries"),
									ocr_enabled: argv["ocr-enabled"],
								}),
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
						profile_id: argv["profile-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				ai_context_enabled: argv["ai-context-enabled"],
				allowed_match_count: argv["allowed-match-count"],
				confidence_threshold: resolveFileToken(
					argv["confidence-threshold"] as string | undefined,
					"confidence-threshold",
					"text"
				),
				context_awareness: {
					enabled: argv["context-awareness-enabled"],
					skip: {
						files: argv["context-awareness-skip-files"],
					},
				},
				entries: parseObjectArray(argv["entries"], "entries"),
				ocr_enabled: argv["ocr-enabled"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					profile_id: argv["profile-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
