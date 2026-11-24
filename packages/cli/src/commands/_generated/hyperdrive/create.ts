import operation from "../_operations/hyperdrive/create.js";
/**
 * create command
 * @generated from apis/overlays/hyperdrive.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Hyperdrive",
	usage:
		"$0 hyperdrive create\n\nCreates and returns a new Hyperdrive configuration. For a PlanetScale integration, the Cloudflare account must already be linked to PlanetScale in the Hyperdrive dashboard.",
	flags: {
		"mtls-ca-certificate-id": {
			kind: "parsed",
			brief: "Define CA certificate ID obtained after uploading CA cert.",
			optional: true,
			parse: String,
		},
		"mtls-certificate-id": {
			kind: "parsed",
			brief: "Define mTLS certificate ID obtained after uploading client cert.",
			optional: true,
			parse: String,
		},
		"mtls-sslmode": {
			kind: "parsed",
			brief:
				"PostgreSQL accepts `require`, `verify-ca`, and `verify-full`. MySQL accepts `REQUIRED`, `VERIFY_CA`, and `VERIFY_IDENTITY`. The verify modes require a CA certificate; the require modes cannot be used with a CA certificate.",
			optional: true,
			choices: [
				"require",
				"verify-ca",
				"verify-full",
				"REQUIRED",
				"VERIFY_CA",
				"VERIFY_IDENTITY",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "mtls-sslmode", "text"),
		},
		name: {
			kind: "parsed",
			brief:
				"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API.",
			optional: true,
			parse: String,
		},
		"origin-connection-limit": {
			kind: "parsed",
			brief:
				"The (soft) maximum number of connections the Hyperdrive is allowed to make to the origin database.\n\nMaximum allowed: 20 for free tier accounts, 100 for paid tier accounts.\nIf not specified, defaults to 20 for free tier and 60 for paid tier.\nCertain Cloudflare-managed origins may be permitted a higher limit.\nContact Cloudflare if you need a higher limit.",
			optional: true,
			parse: Number,
		},
		"integration-custom-database-name": {
			kind: "parsed",
			brief:
				"The database name to use when connecting. Defaults to `postgres` for PostgreSQL and `mysql` for MySQL.",
			optional: true,
			parse: String,
		},
		"integration-database-branch-name": {
			kind: "parsed",
			brief: "The name of the PlanetScale database branch.",
			optional: true,
			parse: String,
		},
		"integration-database-name": {
			kind: "parsed",
			brief: "The name of the PlanetScale database.",
			optional: true,
			parse: String,
		},
		"integration-organization-name": {
			kind: "parsed",
			brief: "The name of the PlanetScale organization.",
			optional: true,
			parse: String,
		},
		"integration-provider": {
			kind: "parsed",
			brief: "The database integration provider used by this operation.",
			optional: true,
			choices: ["planetscale"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "integration-provider", "text"),
		},
		"integration-scheme": {
			kind: "parsed",
			brief:
				"Specifies the URL scheme used to connect to your origin database.",
			optional: true,
			choices: ["postgres", "postgresql", "mysql"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "integration-scheme", "text"),
		},
		"origin-database": {
			kind: "parsed",
			brief: "Set the name of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-password": {
			kind: "parsed",
			brief:
				"Set the password needed to access your origin database. The API never returns this write-only value.",
			optional: true,
			parse: String,
		},
		"origin-scheme": {
			kind: "parsed",
			brief:
				"Specifies the URL scheme used to connect to your origin database.",
			optional: true,
			choices: ["postgres", "postgresql", "mysql"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "origin-scheme", "text"),
		},
		"origin-user": {
			kind: "parsed",
			brief: "Set the user of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-host": {
			kind: "parsed",
			brief:
				"Variant descriptions:\n- Defines the publicly reachable hostname or IP of your origin database. Private, loopback, and link-local IP addresses are not allowed.\n- Defines the host (hostname or IP) of your origin database.",
			optional: true,
			parse: String,
		},
		"origin-port": {
			kind: "parsed",
			brief:
				"Defines the port of your origin database. Defaults to 5432 for PostgreSQL or 3306 for MySQL if not specified.",
			optional: true,
			parse: Number,
		},
		"origin-access-client-id": {
			kind: "parsed",
			brief:
				"Defines the Client ID of the Access token to use when connecting to the origin database.",
			optional: true,
			parse: String,
		},
		"origin-access-client-secret": {
			kind: "parsed",
			brief:
				"Defines the Client Secret of the Access Token to use when connecting to the origin database. The API never returns this write-only value.",
			optional: true,
			parse: String,
		},
		"origin-service-id": {
			kind: "parsed",
			brief:
				"The identifier of the Workers VPC Service to connect through. Hyperdrive will egress through the specified VPC Service to reach the origin database.",
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
			brief:
				"A request to create a Hyperdrive configuration using exactly one of caller-supplied origin credentials or a managed integration.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	rules(rules) {
		rules.conflicts("integration-custom-database-name", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-custom-database-name", [
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.conflicts("integration-database-branch-name", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-database-branch-name", [
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.conflicts("integration-database-name", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-database-name", [
			"integration-database-branch-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.conflicts("integration-organization-name", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-organization-name", [
			"integration-database-branch-name",
			"integration-database-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.conflicts("integration-provider", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-provider", [
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-scheme",
		]);
		rules.conflicts("integration-scheme", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("integration-scheme", [
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
		]);
		rules.conflicts("origin-database", [
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-database", [
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-password", [
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-password", [
			"origin-database",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-scheme", [
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-scheme", [
			"origin-database",
			"origin-password",
			"origin-user",
		]);
		rules.conflicts("origin-user", [
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-user", [
			"origin-database",
			"origin-password",
			"origin-scheme",
		]);
		rules.conflicts("origin-host", [
			"origin-service-id",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-host", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-port", [
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-port", [
			"origin-host",
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-access-client-id", [
			"origin-port",
			"origin-service-id",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-access-client-id", [
			"origin-host",
			"origin-access-client-secret",
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-access-client-secret", [
			"origin-port",
			"origin-service-id",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-access-client-secret", [
			"origin-host",
			"origin-access-client-id",
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
		rules.conflicts("origin-service-id", [
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
			"integration-custom-database-name",
			"integration-database-branch-name",
			"integration-database-name",
			"integration-organization-name",
			"integration-provider",
			"integration-scheme",
		]);
		rules.implies("origin-service-id", [
			"origin-database",
			"origin-password",
			"origin-scheme",
			"origin-user",
		]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
												argv["origin-access-client-secret"] as
													| string
													| undefined,
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
		),
});

export default command;
