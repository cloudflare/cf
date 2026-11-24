import operation from "../../../../_operations/zero-trust/dlp/profiles/custom/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust dlp profiles custom create",
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
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust dlp profiles custom create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/profiles/custom`,
					pathParams: {},
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
									data_classes: argv["data-classes"],
									data_tags: argv["data-tags"],
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									entries: parseObjectArray(argv["entries"], "entries"),
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									ocr_enabled: argv["ocr-enabled"],
									sensitivity_levels: parseObjectArray(
										argv["sensitivity-levels"],
										"sensitivity-levels"
									),
									shared_entries: parseObjectArray(
										argv["shared-entries"],
										"shared-entries"
									),
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

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
				data_classes: argv["data-classes"],
				data_tags: argv["data-tags"],
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				entries: parseObjectArray(argv["entries"], "entries"),
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				ocr_enabled: argv["ocr-enabled"],
				sensitivity_levels: parseObjectArray(
					argv["sensitivity-levels"],
					"sensitivity-levels"
				),
				shared_entries: parseObjectArray(
					argv["shared-entries"],
					"shared-entries"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
