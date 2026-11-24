import operation from "../../_operations/mcp/servers/update.js";
/**
 * update command
 * @generated from apis/overlays/mcp.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "update <id>",
	describe: "Update an MCP Server",
	usage:
		"$0 mcp servers update <id>\n\nUpdates an MCP server's configuration and credentials.",
	flags: {
		"auth-credentials": {
			kind: "parsed",
			brief:
				'Credential configuration for the upstream MCP server. For auth_type "bearer", either a raw token string (e.g. "sk-abc123"), which is wrapped server-side as `Authorization: Bearer <token>`, or a JSON-encoded object of the form `{"headers":{"Header-Name":"value",...}}` for custom or multiple static headers (e.g. Cloudflare Access service tokens: `{"headers":{"cf-access-client-id":"...","cf-access-client-secret":"..."}}`). For auth_type "oauth" with a pre-registered client, send a JSON-encoded object containing `auth_mode:"manual"`, `config.authorization_endpoint`, `config.token_endpoint`, and `registration_info.client_id`. Also provide `registration_info.redirect_uris` unless `is_shared_oauth_callback_enabled` is true. Optional fields include `config.issuer`, `config.revocation_endpoint`, `registration_info.scope`, and `registration_info.token_endpoint_auth_method`. Send the client secret in the separate `client_secret` field. Omit `auth_credentials` on update to preserve the existing configuration.',
			optional: true,
			parse: String,
		},
		"client-secret": {
			kind: "parsed",
			brief:
				"Provides 'client_secret' for a pre-registered OAuth client. This field is accepted on create or update only when 'auth_credentials.auth_mode' is 'manual'. It is required when creating an MCP server with manual OAuth credentials or changing an existing server to use manual OAuth credentials. Omit 'client_secret' on update to preserve the existing secret. Provide a new 'client_secret' to rotate the secret. The secret is never returned by read, create, or update requests.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Optional description of the MCP server.",
			optional: true,
			parse: String,
		},
		"is-shared-oauth-callback-enabled": {
			kind: "boolean",
			brief:
				"When true, per-user authorization uses the shared Cloudflare callback URL as the 'redirect_uri' instead of the portal callback URL. The default is false. Set 'is_shared_oauth_callback_enabled' to true to enable the shared Cloudflare callback URL for this MCP server.",
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Display name for the MCP server.",
			optional: true,
			parse: String,
		},
		"secure-web-gateway": {
			kind: "boolean",
			brief:
				"Route outbound traffic to this MCP server through Zero Trust Secure Web Gateway.",
			optional: true,
		},
		"updated-prompts": {
			kind: "parsed",
			brief:
				'Prompt overrides. Omit to preserve, send [] to clear, or null to reset the field to absence. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"name": string, "alias"?: string, "description"?: string, "enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"updated-tools": {
			kind: "parsed",
			brief:
				'Tool overrides. Omit to preserve, send [] to clear, or null to reset the field to absence. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"name": string, "alias"?: string, "description"?: string, "enabled"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "id",
			brief: "Unique identifier for the MCP server.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
		),
});

export default command;
