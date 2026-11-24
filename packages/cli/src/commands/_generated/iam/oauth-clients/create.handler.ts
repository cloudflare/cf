import operation from "../../_operations/iam/oauth-clients/create.js";
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "iam oauth-clients create",
			classification: {
				safeFlags: ["token-endpoint-auth-method", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
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
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf iam oauth-clients create",
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
									post_logout_redirect_uris: argv["post-logout-redirect-uris"],
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
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
