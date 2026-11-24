import operation from "../../_operations/builds/tokens/create.js";
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
			command: "builds tokens create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["build-token-name"] === undefined) {
					argv["build-token-name"] = await promptForRequiredField(
						"build-token-name",
						"The build_token_name field"
					);
				}
				if (argv["build-token-secret"] === undefined) {
					argv["build-token-secret"] = await promptForRequiredField(
						"build-token-secret",
						"The build_token_secret field"
					);
				}
				if (argv["cloudflare-token-id"] === undefined) {
					argv["cloudflare-token-id"] = await promptForRequiredField(
						"cloudflare-token-id",
						"The cloudflare_token_id field"
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf builds tokens create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/tokens`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									build_token_name: resolveFileToken(
										argv["build-token-name"] as string | undefined,
										"build-token-name",
										"text"
									),
									build_token_secret: resolveFileToken(
										argv["build-token-secret"] as string | undefined,
										"build-token-secret",
										"text"
									),
									cloudflare_token_id: resolveFileToken(
										argv["cloudflare-token-id"] as string | undefined,
										"cloudflare-token-id",
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
				build_token_name: resolveFileToken(
					argv["build-token-name"] as string | undefined,
					"build-token-name",
					"text"
				),
				build_token_secret: resolveFileToken(
					argv["build-token-secret"] as string | undefined,
					"build-token-secret",
					"text"
				),
				cloudflare_token_id: resolveFileToken(
					argv["cloudflare-token-id"] as string | undefined,
					"cloudflare-token-id",
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
