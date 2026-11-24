import operation from "../../_operations/mcp/servers/update.js";
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
			command: "mcp servers update",
			classification: {
				safeFlags: [
					"is-shared-oauth-callback-enabled",
					"secure-web-gateway",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf mcp servers update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/ai-controls/mcp/servers/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}`,
					pathParams: { id: String(argv["id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									auth_credentials: resolveFileToken(
										argv["auth-credentials"] as string | undefined,
										"auth-credentials",
										"text"
									),
									client_secret: resolveFileToken(
										argv["client-secret"] as string | undefined,
										"client-secret",
										"text"
									),
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									is_shared_oauth_callback_enabled:
										argv["is-shared-oauth-callback-enabled"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									secure_web_gateway: argv["secure-web-gateway"],
									updated_prompts: parseObjectArray(
										argv["updated-prompts"],
										"updated-prompts",
										true
									),
									updated_tools: parseObjectArray(
										argv["updated-tools"],
										"updated-tools",
										true
									),
								}),
					sensitiveBodyPaths: [["auth_credentials"], ["client_secret"]],
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
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				auth_credentials: resolveFileToken(
					argv["auth-credentials"] as string | undefined,
					"auth-credentials",
					"text"
				),
				client_secret: resolveFileToken(
					argv["client-secret"] as string | undefined,
					"client-secret",
					"text"
				),
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				is_shared_oauth_callback_enabled:
					argv["is-shared-oauth-callback-enabled"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				secure_web_gateway: argv["secure-web-gateway"],
				updated_prompts: parseObjectArray(
					argv["updated-prompts"],
					"updated-prompts",
					true
				),
				updated_tools: parseObjectArray(
					argv["updated-tools"],
					"updated-tools",
					true
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					id: argv["id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
