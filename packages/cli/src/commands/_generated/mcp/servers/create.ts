import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/mcp.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 mcp servers create\n\nCreates a new MCP server for connecting to an upstream MCP endpoint."
		)
		.option("auth-credentials", {
			type: "string",
			description:
				'Static credential for the upstream MCP server. For auth_type "bearer", either a raw token string (e.g. "sk-abc123"), which is wrapped server-side as `Authorization: Bearer <token>`, or a JSON-encoded object of the form `{"headers":{"Header-Name":"value",...}}` for custom or multiple static headers (e.g. Cloudflare Access service tokens: `{"headers":{"cf-access-client-id":"...","cf-access-client-secret":"..."}}`).',
		})
		.option("auth-type", {
			type: "string",
			description:
				"Authentication method used to connect to the upstream MCP server.",
			choices: ["oauth", "bearer", "unauthenticated"],
		})
		.option("client-secret", {
			type: "string",
			description:
				"Pre-registered OAuth client_secret. Write-only - accepted on create/update when auth_credentials.auth_mode is 'manual'. Stored AES-GCM-encrypted in server_oauth_secrets; never returned by read endpoints.",
		})
		.option("description", {
			type: "string",
			description: "Optional description of the MCP server.",
		})
		.option("hostname", {
			type: "string",
			description: "URL of the upstream MCP endpoint.",
		})
		.option("id", {
			type: "string",
			description: "Unique identifier for the MCP server.",
		})
		.option("is-shared-oauth-callback-enabled", {
			type: "boolean",
			description:
				"When true, the gateway worker uses the shared Cloudflare-owned OAuth callback endpoint as the redirect_uri for upstream on-behalf OAuth, instead of the customer portal hostname. Defaults to false (off); opt in per server by setting true.",
			default: false,
		})
		.option("name", {
			type: "string",
			description: "Display name for the MCP server.",
		})
		.option("secure-web-gateway", {
			type: "boolean",
			description:
				"Route outbound traffic to this MCP server through Zero Trust Secure Web Gateway.",
			default: false,
		})
		.option("updated-prompts", {
			type: "string",
			description:
				"Server-wide prompt capability overrides. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("updated-tools", {
			type: "string",
			description:
				"Server-wide tool capability overrides. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"mcp-portals-api-create-servers">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a new MCP Server",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mcp servers create",
				classification: {
					safeFlags: [
						"auth-type",
						"is-shared-oauth-callback-enabled",
						"secure-web-gateway",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
										auth_type: resolveFileToken(
											argv["auth-type"] as string | undefined,
											"auth-type",
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
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.mcp.servers.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					auth_credentials: resolveFileToken(
						argv["auth-credentials"] as string | undefined,
						"auth-credentials",
						"text"
					),
					auth_type: resolveFileToken(
						argv["auth-type"] as string | undefined,
						"auth-type",
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
					updated_tools: parseObjectArray(
						argv["updated-tools"],
						"updated-tools"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.mcp.servers.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
