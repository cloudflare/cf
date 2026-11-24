import operation from "../../_operations/mcp/servers/create.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "mcp servers create",
			classification: {
				safeFlags: [
					"auth-type",
					"is-shared-oauth-callback-enabled",
					"secure-web-gateway",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["auth-type"] === undefined) {
					argv["auth-type"] = await promptForRequiredEnumField(
						"auth-type",
						"Authentication method used to connect to the upstream MCP server.",
						["oauth", "bearer", "unauthenticated"] as const
					);
				}
				if (argv["hostname"] === undefined) {
					argv["hostname"] = await promptForRequiredField(
						"hostname",
						"URL of the upstream MCP endpoint."
					);
				}
				if (argv["id"] === undefined) {
					argv["id"] = await promptForRequiredField(
						"id",
						"Unique identifier for the MCP server."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Display name for the MCP server."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf mcp servers create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/ai-controls/mcp/servers`,
					pathParams: {},
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
									auth_type: argv["auth-type"],
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
									hostname: resolveFileToken(
										argv["hostname"] as string | undefined,
										"hostname",
										"text"
									),
									id: resolveFileToken(
										argv["id"] as string | undefined,
										"id",
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
										"updated-prompts"
									),
									updated_tools: parseObjectArray(
										argv["updated-tools"],
										"updated-tools"
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				auth_credentials: resolveFileToken(
					argv["auth-credentials"] as string | undefined,
					"auth-credentials",
					"text"
				),
				auth_type: argv["auth-type"],
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
				hostname: resolveFileToken(
					argv["hostname"] as string | undefined,
					"hostname",
					"text"
				),
				id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
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
					"updated-prompts"
				),
				updated_tools: parseObjectArray(argv["updated-tools"], "updated-tools"),
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
