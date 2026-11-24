import operation from "../../_operations/iam/oauth-clients/update.js";
/**
 * update command
 * @generated from apis/overlays/iam.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <oauth-client-id>",
	describe: "Update OAuth Client",
	usage:
		"$0 iam oauth-clients update <oauth-client-id>\n\nUpdate an existing OAuth client. Only include fields you want to update.",
	flags: {
		"allowed-cors-origins": {
			kind: "parsed",
			brief: "Array of allowed CORS origins.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"client-name": {
			kind: "parsed",
			brief: "Human-readable name of the OAuth client.",
			optional: true,
			parse: String,
		},
		"client-uri": {
			kind: "parsed",
			brief: "URL of the home page of the client.",
			optional: true,
			parse: String,
		},
		"grant-types": {
			kind: "parsed",
			brief:
				"Array of OAuth grant types the client is allowed to use. `authorization_code` is required; `refresh_token` may be included optionally.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"logo-uri": {
			kind: "parsed",
			brief: "URL of the client's logo.",
			optional: true,
			parse: String,
		},
		"optional-scopes": {
			kind: "parsed",
			brief:
				"Scopes that the authorizing user may decline during consent. Each value must also appear in `scopes`. The scopes `openid`, `offline`, and `offline_access` cannot be optional.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"policy-uri": {
			kind: "parsed",
			brief: "URL that points to a privacy policy document.",
			optional: true,
			parse: String,
		},
		"post-logout-redirect-uris": {
			kind: "parsed",
			brief: "Array of allowed post-logout redirect URIs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"redirect-uris": {
			kind: "parsed",
			brief: "Array of allowed redirect URIs for the client.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"response-types": {
			kind: "parsed",
			brief: "Array of OAuth response types the client is allowed to use.",
			variadic: true,
			optional: true,
			parse: String,
		},
		scopes: {
			kind: "parsed",
			brief:
				"Array of OAuth scopes the client is allowed to request. Colon-delimited scopes are not accepted. Dot-delimited scopes are validated against available OAuth API scopes; simple identity scopes are allowed. Protocol scopes `offline_access` and `openid` are added or removed automatically based on `grant_types` and `response_types`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"token-endpoint-auth-method": {
			kind: "parsed",
			brief: "The authentication method the client uses at the token endpoint.",
			optional: true,
			choices: ["none", "client_secret_basic", "client_secret_post"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "token-endpoint-auth-method", "text"),
		},
		"tos-uri": {
			kind: "parsed",
			brief: "URL that points to a terms of service document.",
			optional: true,
			parse: String,
		},
		visibility: {
			kind: "parsed",
			brief:
				"Promote the OAuth client from private to public visibility. Only `public` is accepted; demotion to `private` is not supported. Promotion requires a non-empty client name, logo URI, verified client URI host, and at least one non-identity scope.",
			optional: true,
			choices: ["public"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "visibility", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Partial update request for an OAuth client. Only include fields you want to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "oauth-client-id",
			brief: "The unique identifier for an OAuth client.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "iam oauth-clients update",
				classification: {
					safeFlags: ["token-endpoint-auth-method", "visibility", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf iam oauth-clients update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/oauth_clients/${argv["oauth-client-id"] == null ? "<oauth-client-id>" : encodeURIComponent(String(argv["oauth-client-id"]))}`,
						pathParams: {
							"oauth-client-id": String(argv["oauth-client-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										allowed_cors_origins: argv["allowed-cors-origins"],
										client_name: resolveFileToken(
											argv["client-name"] as string | undefined,
											"client-name",
											"text"
										),
										client_uri: resolveFileToken(
											argv["client-uri"] as string | undefined,
											"client-uri",
											"text"
										),
										grant_types: argv["grant-types"],
										logo_uri: resolveFileToken(
											argv["logo-uri"] as string | undefined,
											"logo-uri",
											"text"
										),
										optional_scopes: argv["optional-scopes"],
										policy_uri: resolveFileToken(
											argv["policy-uri"] as string | undefined,
											"policy-uri",
											"text"
										),
										post_logout_redirect_uris:
											argv["post-logout-redirect-uris"],
										redirect_uris: argv["redirect-uris"],
										response_types: argv["response-types"],
										scopes: argv["scopes"],
										token_endpoint_auth_method:
											argv["token-endpoint-auth-method"],
										tos_uri: resolveFileToken(
											argv["tos-uri"] as string | undefined,
											"tos-uri",
											"text"
										),
										visibility: argv["visibility"],
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
							oauth_client_id: argv["oauth-client-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					allowed_cors_origins: argv["allowed-cors-origins"],
					client_name: resolveFileToken(
						argv["client-name"] as string | undefined,
						"client-name",
						"text"
					),
					client_uri: resolveFileToken(
						argv["client-uri"] as string | undefined,
						"client-uri",
						"text"
					),
					grant_types: argv["grant-types"],
					logo_uri: resolveFileToken(
						argv["logo-uri"] as string | undefined,
						"logo-uri",
						"text"
					),
					optional_scopes: argv["optional-scopes"],
					policy_uri: resolveFileToken(
						argv["policy-uri"] as string | undefined,
						"policy-uri",
						"text"
					),
					post_logout_redirect_uris: argv["post-logout-redirect-uris"],
					redirect_uris: argv["redirect-uris"],
					response_types: argv["response-types"],
					scopes: argv["scopes"],
					token_endpoint_auth_method: argv["token-endpoint-auth-method"],
					tos_uri: resolveFileToken(
						argv["tos-uri"] as string | undefined,
						"tos-uri",
						"text"
					),
					visibility: argv["visibility"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						oauth_client_id: argv["oauth-client-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
