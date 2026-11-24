import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
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
			command: "ai-search tokens update",
			classification: {
				safeFlags: ["legacy", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["api-token-id"] === undefined) {
					argv["api-token-id"] = await promptForRequiredField(
						"api-token-id",
						"Cloudflare API token ID."
					);
				}
				if (argv["api-token"] === undefined) {
					argv["api-token"] = await promptForRequiredField(
						"api-token",
						"Cloudflare API token value.",
						{ kind: "secret" }
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Human-readable name for the credential."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-search tokens update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/tokens/${argv["token-id"] == null ? "<token-id>" : encodeURIComponent(String(argv["token-id"]))}`,
					pathParams: { "token-id": String(argv["token-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									cf_api_id: resolveFileToken(
										argv["api-token-id"] as string | undefined,
										"api-token-id",
										"text"
									),
									cf_api_key: resolveFileToken(
										argv["api-token"] as string | undefined,
										"api-token",
										"text"
									),
									legacy: argv["legacy"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
								}),
					sensitiveBodyPaths: [["cf_api_key"]],
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
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/ai-search/tokens/${encodeURIComponent(String(argv["token-id"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["api-token-id"] !== undefined)
				setNestedValue(
					bodyData,
					["cf_api_id"],
					resolveFileToken(
						argv["api-token-id"] as string | undefined,
						"api-token-id",
						"text"
					)
				);
			if (argv["api-token"] !== undefined)
				setNestedValue(
					bodyData,
					["cf_api_key"],
					resolveFileToken(
						argv["api-token"] as string | undefined,
						"api-token",
						"text"
					)
				);
			if (argv["legacy"] !== undefined)
				setNestedValue(bodyData, ["legacy"], argv["legacy"]);
			if (argv["name"] !== undefined)
				setNestedValue(
					bodyData,
					["name"],
					resolveFileToken(argv["name"] as string | undefined, "name", "text")
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/accounts/${accountId}/ai-search/tokens/${encodeURIComponent(String(argv["token-id"]))}`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
