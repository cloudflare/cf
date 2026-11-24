import operation from "../../_operations/iam/oauth-clients/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
