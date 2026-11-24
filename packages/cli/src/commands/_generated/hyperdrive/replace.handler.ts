import operation from "../_operations/hyperdrive/replace.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./replace.js";
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
			command: "hyperdrive replace",
			classification: {
				safeFlags: [
					"caching-disabled",
					"mtls-sslmode",
					"origin-scheme",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API."
					);
				}
				if (argv["origin-database"] === undefined) {
					argv["origin-database"] = await promptForRequiredField(
						"origin-database",
						"Set the name of your origin database."
					);
				}
				if (argv["origin-password"] === undefined) {
					argv["origin-password"] = await promptForRequiredField(
						"origin-password",
						"Set the password needed to access your origin database. The API never returns this write-only value.",
						{ kind: "secret" }
					);
				}
				if (argv["origin-scheme"] === undefined) {
					argv["origin-scheme"] = await promptForRequiredEnumField(
						"origin-scheme",
						"Specifies the URL scheme used to connect to your origin database.",
						["postgres", "postgresql", "mysql"] as const
					);
				}
				if (argv["origin-user"] === undefined) {
					argv["origin-user"] = await promptForRequiredField(
						"origin-user",
						"Set the user of your origin database."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf hyperdrive replace",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/hyperdrive/configs/${argv["hyperdrive-id"] == null ? "<hyperdrive-id>" : encodeURIComponent(String(argv["hyperdrive-id"]))}`,
					pathParams: { "hyperdrive-id": String(argv["hyperdrive-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									caching: {
										disabled: argv["caching-disabled"],
										max_age: argv["caching-max-age"],
										stale_while_revalidate:
											argv["caching-stale-while-revalidate"],
									},
									mtls: {
										ca_certificate_id: resolveFileToken(
											argv["mtls-ca-certificate-id"] as string | undefined,
											"mtls-ca-certificate-id",
											"text"
										),
										mtls_certificate_id: resolveFileToken(
											argv["mtls-certificate-id"] as string | undefined,
											"mtls-certificate-id",
											"text"
										),
										sslmode: argv["mtls-sslmode"],
									},
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									origin: {
										database: resolveFileToken(
											argv["origin-database"] as string | undefined,
											"origin-database",
											"text"
										),
										password: resolveFileToken(
											argv["origin-password"] as string | undefined,
											"origin-password",
											"text"
										),
										scheme: argv["origin-scheme"],
										user: resolveFileToken(
											argv["origin-user"] as string | undefined,
											"origin-user",
											"text"
										),
										host: resolveFileToken(
											argv["origin-host"] as string | undefined,
											"origin-host",
											"text"
										),
										port: argv["origin-port"],
										access_client_id: resolveFileToken(
											argv["origin-access-client-id"] as string | undefined,
											"origin-access-client-id",
											"text"
										),
										access_client_secret: resolveFileToken(
											argv["origin-access-client-secret"] as string | undefined,
											"origin-access-client-secret",
											"text"
										),
										service_id: resolveFileToken(
											argv["origin-service-id"] as string | undefined,
											"origin-service-id",
											"text"
										),
									},
									origin_connection_limit: argv["origin-connection-limit"],
								}),
					sensitiveBodyPaths: [
						["origin", "password"],
						["origin", "access_client_secret"],
					],
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
						hyperdrive_id: argv["hyperdrive-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
				caching: {
					disabled: argv["caching-disabled"],
					max_age: argv["caching-max-age"],
					stale_while_revalidate: argv["caching-stale-while-revalidate"],
				},
				mtls: {
					ca_certificate_id: resolveFileToken(
						argv["mtls-ca-certificate-id"] as string | undefined,
						"mtls-ca-certificate-id",
						"text"
					),
					mtls_certificate_id: resolveFileToken(
						argv["mtls-certificate-id"] as string | undefined,
						"mtls-certificate-id",
						"text"
					),
					sslmode: argv["mtls-sslmode"],
				},
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				origin: {
					database: resolveFileToken(
						argv["origin-database"] as string | undefined,
						"origin-database",
						"text"
					),
					password: resolveFileToken(
						argv["origin-password"] as string | undefined,
						"origin-password",
						"text"
					),
					scheme: argv["origin-scheme"],
					user: resolveFileToken(
						argv["origin-user"] as string | undefined,
						"origin-user",
						"text"
					),
					host: resolveFileToken(
						argv["origin-host"] as string | undefined,
						"origin-host",
						"text"
					),
					port: argv["origin-port"],
					access_client_id: resolveFileToken(
						argv["origin-access-client-id"] as string | undefined,
						"origin-access-client-id",
						"text"
					),
					access_client_secret: resolveFileToken(
						argv["origin-access-client-secret"] as string | undefined,
						"origin-access-client-secret",
						"text"
					),
					service_id: resolveFileToken(
						argv["origin-service-id"] as string | undefined,
						"origin-service-id",
						"text"
					),
				},
				origin_connection_limit: argv["origin-connection-limit"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					hyperdrive_id: argv["hyperdrive-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
