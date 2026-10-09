import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/oauth-clients.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 oauth-clients create\n\nCreate a new OAuth client for an account."
		)
		.option("allowed-cors-origins", {
			type: "string",
			array: true,
			description: "Array of allowed CORS origins.",
		})
		.option("client-name", {
			type: "string",
			description: "Human-readable name of the OAuth client.",
		})
		.option("client-uri", {
			type: "string",
			description: "URL of the home page of the client.",
		})
		.option("grant-types", {
			type: "string",
			array: true,
			description:
				"Array of OAuth grant types the client is allowed to use. `authorization_code` is required; `refresh_token` may be included optionally.",
		})
		.option("logo-uri", {
			type: "string",
			description: "URL of the client's logo.",
		})
		.option("optional-scopes", {
			type: "string",
			array: true,
			description:
				"Scopes that the authorizing user may decline during consent. Each value must also appear in `scopes`. The scopes `openid`, `offline`, and `offline_access` cannot be optional.",
		})
		.option("policy-uri", {
			type: "string",
			description: "URL that points to a privacy policy document.",
		})
		.option("post-logout-redirect-uris", {
			type: "string",
			array: true,
			description: "Array of allowed post-logout redirect URIs.",
		})
		.option("redirect-uris", {
			type: "string",
			array: true,
			description: "Array of allowed redirect URIs for the client.",
		})
		.option("response-types", {
			type: "string",
			array: true,
			description:
				"Array of OAuth response types the client is allowed to use.",
		})
		.option("scopes", {
			type: "string",
			array: true,
			description:
				"Array of OAuth scopes the client is allowed to request. Colon-delimited scopes are not accepted. Dot-delimited scopes are validated against available OAuth API scopes; simple identity scopes are allowed. Protocol scopes `offline_access` and `openid` are added or removed automatically based on `grant_types` and `response_types`.",
		})
		.option("token-endpoint-auth-method", {
			type: "string",
			description:
				"The authentication method the client uses at the token endpoint.",
			choices: ["none", "client_secret_basic", "client_secret_post"],
		})
		.coerce("token-endpoint-auth-method", (value: string | undefined) =>
			resolveFileToken(value, "token-endpoint-auth-method", "text")
		)
		.option("tos-uri", {
			type: "string",
			description: "URL that points to a terms of service document.",
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

type Request = SdkRequest<"oauth-clients-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create OAuth Client",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "oauth-clients create",
				classification: {
					safeFlags: ["token-endpoint-auth-method", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf oauth-clients create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/oauth_clients`,
						pathParams: {},
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
						client.oauthClients.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["client-name"] === undefined) {
					argv["client-name"] = await promptForRequiredField(
						"client-name",
						"Human-readable name of the OAuth client."
					);
				}
				if (argv["grant-types"] === undefined) {
					throw new Error(
						"--grant-types is required (or pass --body with this field set)."
					);
				}
				if (argv["redirect-uris"] === undefined) {
					throw new Error(
						"--redirect-uris is required (or pass --body with this field set)."
					);
				}
				if (argv["response-types"] === undefined) {
					throw new Error(
						"--response-types is required (or pass --body with this field set)."
					);
				}
				if (argv["scopes"] === undefined) {
					throw new Error(
						"--scopes is required (or pass --body with this field set)."
					);
				}
				if (argv["token-endpoint-auth-method"] === undefined) {
					argv["token-endpoint-auth-method"] = await promptForRequiredEnumField(
						"token-endpoint-auth-method",
						"The authentication method the client uses at the token endpoint.",
						["none", "client_secret_basic", "client_secret_post"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.oauthClients.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
