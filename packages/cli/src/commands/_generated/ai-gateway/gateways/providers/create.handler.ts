import operation from "../../../_operations/ai-gateway/gateways/providers/create.js";
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
			command: "ai-gateway gateways providers create",
			classification: {
				safeFlags: ["default-config", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["alias"] === undefined) {
					argv["alias"] = await promptForRequiredField(
						"alias",
						"The alias field"
					);
				}
				if (argv["default-config"] === undefined) {
					throw new Error(
						"--default-config is required (or pass --body with this field set)."
					);
				}
				if (argv["provider-slug"] === undefined) {
					argv["provider-slug"] = await promptForRequiredField(
						"provider-slug",
						"The provider_slug field"
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-gateway gateways providers create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/provider_configs`,
					pathParams: { "gateway-id": String(argv["gateway-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									alias: resolveFileToken(
										argv["alias"] as string | undefined,
										"alias",
										"text"
									),
									default_config: argv["default-config"],
									provider_slug: resolveFileToken(
										argv["provider-slug"] as string | undefined,
										"provider-slug",
										"text"
									),
									rate_limit: argv["rate-limit"],
									rate_limit_period: argv["rate-limit-period"],
									secret: resolveFileToken(
										argv["secret"] as string | undefined,
										"secret",
										"text"
									),
									secret_id: resolveFileToken(
										argv["secret-id"] as string | undefined,
										"secret-id",
										"text"
									),
								}),
					sensitiveBodyPaths: [["secret"]],
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
						gateway_id: argv["gateway-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				alias: resolveFileToken(
					argv["alias"] as string | undefined,
					"alias",
					"text"
				),
				default_config: argv["default-config"],
				provider_slug: resolveFileToken(
					argv["provider-slug"] as string | undefined,
					"provider-slug",
					"text"
				),
				rate_limit: argv["rate-limit"],
				rate_limit_period: argv["rate-limit-period"],
				secret: resolveFileToken(
					argv["secret"] as string | undefined,
					"secret",
					"text"
				),
				secret_id: resolveFileToken(
					argv["secret-id"] as string | undefined,
					"secret-id",
					"text"
				),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					gateway_id: argv["gateway-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
