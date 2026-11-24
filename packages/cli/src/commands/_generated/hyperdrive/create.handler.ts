import operation from "../_operations/hyperdrive/create.js";
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
			command: "hyperdrive create",
			classification: {
				safeFlags: [
					"mtls-sslmode",
					"integration-provider",
					"integration-scheme",
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
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf hyperdrive create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/hyperdrive/configs`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
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
									origin_connection_limit: argv["origin-connection-limit"],
									integration: {
										custom_database_name: resolveFileToken(
											argv["integration-custom-database-name"] as
												| string
												| undefined,
											"integration-custom-database-name",
											"text"
										),
										database_branch_name: resolveFileToken(
											argv["integration-database-branch-name"] as
												| string
												| undefined,
											"integration-database-branch-name",
											"text"
										),
										database_name: resolveFileToken(
											argv["integration-database-name"] as string | undefined,
											"integration-database-name",
											"text"
										),
										organization_name: resolveFileToken(
											argv["integration-organization-name"] as
												| string
												| undefined,
											"integration-organization-name",
											"text"
										),
										provider: argv["integration-provider"],
										scheme: argv["integration-scheme"],
									},
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
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData = compactBody({
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
				origin_connection_limit: argv["origin-connection-limit"],
				integration: {
					custom_database_name: resolveFileToken(
						argv["integration-custom-database-name"] as string | undefined,
						"integration-custom-database-name",
						"text"
					),
					database_branch_name: resolveFileToken(
						argv["integration-database-branch-name"] as string | undefined,
						"integration-database-branch-name",
						"text"
					),
					database_name: resolveFileToken(
						argv["integration-database-name"] as string | undefined,
						"integration-database-name",
						"text"
					),
					organization_name: resolveFileToken(
						argv["integration-organization-name"] as string | undefined,
						"integration-organization-name",
						"text"
					),
					provider: argv["integration-provider"],
					scheme: argv["integration-scheme"],
				},
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
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
