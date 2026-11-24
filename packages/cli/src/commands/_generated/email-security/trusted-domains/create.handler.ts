import operation from "../../_operations/email-security/trusted-domains/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "email-security trusted-domains create",
			classification: {
				safeFlags: ["is-recent", "is-regex", "is-similarity", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["is-recent"] === undefined) {
					throw new Error(
						"--is-recent is required (or pass --body with this field set)."
					);
				}
				if (argv["is-regex"] === undefined) {
					throw new Error(
						"--is-regex is required (or pass --body with this field set)."
					);
				}
				if (argv["is-similarity"] === undefined) {
					throw new Error(
						"--is-similarity is required (or pass --body with this field set)."
					);
				}
				if (argv["pattern"] === undefined) {
					argv["pattern"] = await promptForRequiredField(
						"pattern",
						"The domain pattern to trust, e.g. \`example.com\`."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-security trusted-domains create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/trusted_domains`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									comments: resolveFileToken(
										argv["comments"] as string | undefined,
										"comments",
										"text"
									),
									is_recent: argv["is-recent"],
									is_regex: argv["is-regex"],
									is_similarity: argv["is-similarity"],
									pattern: resolveFileToken(
										argv["pattern"] as string | undefined,
										"pattern",
										"text"
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
				comments: resolveFileToken(
					argv["comments"] as string | undefined,
					"comments",
					"text"
				),
				is_recent: argv["is-recent"],
				is_regex: argv["is-regex"],
				is_similarity: argv["is-similarity"],
				pattern: resolveFileToken(
					argv["pattern"] as string | undefined,
					"pattern",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
