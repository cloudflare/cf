import operation from "../_operations/hyperdrive/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/hyperdrive.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 hyperdrive create\n\nCreates and returns a new Hyperdrive configuration. For a PlanetScale integration, the Cloudflare account must already be linked to PlanetScale in the Hyperdrive dashboard."
		)
		.option("mtls-ca-certificate-id", {
			type: "string",
			description: "Define CA certificate ID obtained after uploading CA cert.",
		})
		.option("mtls-certificate-id", {
			type: "string",
			description:
				"Define mTLS certificate ID obtained after uploading client cert.",
		})
		.option("mtls-sslmode", {
			type: "string",
			description:
				"PostgreSQL accepts `require`, `verify-ca`, and `verify-full`. MySQL accepts `REQUIRED`, `VERIFY_CA`, and `VERIFY_IDENTITY`. The verify modes require a CA certificate; the require modes cannot be used with a CA certificate.",
			choices: [
				"require",
				"verify-ca",
				"verify-full",
				"REQUIRED",
				"VERIFY_CA",
				"VERIFY_IDENTITY",
			],
		})
		.coerce("mtls-sslmode", (value) =>
			resolveFileToken(value, "mtls-sslmode", "text")
		)
		.option("name", {
			type: "string",
			description:
				"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API.",
		})
		.option("origin-connection-limit", {
			type: "number",
			description:
				"The (soft) maximum number of connections the Hyperdrive is allowed to make to the origin database.\n\nMaximum allowed: 20 for free tier accounts, 100 for paid tier accounts.\nIf not specified, defaults to 20 for free tier and 60 for paid tier.\nCertain Cloudflare-managed origins may be permitted a higher limit.\nContact Cloudflare if you need a higher limit.\n",
		})
		.option("integration-custom-database-name", {
			type: "string",
			description:
				"The database name to use when connecting. Defaults to `postgres` for PostgreSQL and `mysql` for MySQL.",
		})
		.option("integration-database-branch-name", {
			type: "string",
			description: "The name of the PlanetScale database branch.",
		})
		.option("integration-database-name", {
			type: "string",
			description: "The name of the PlanetScale database.",
		})
		.option("integration-organization-name", {
			type: "string",
			description: "The name of the PlanetScale organization.",
		})
		.option("integration-provider", {
			type: "string",
			description: "The database integration provider used by this operation.",
			choices: ["planetscale"],
		})
		.coerce("integration-provider", (value) =>
			resolveFileToken(value, "integration-provider", "text")
		)
		.option("integration-scheme", {
			type: "string",
			description:
				"Specifies the URL scheme used to connect to your origin database.",
			choices: ["postgres", "postgresql", "mysql"],
		})
		.coerce("integration-scheme", (value) =>
			resolveFileToken(value, "integration-scheme", "text")
		)
		.option("origin-database", {
			type: "string",
			description: "Set the name of your origin database.",
		})
		.option("origin-password", {
			type: "string",
			description:
				"Set the password needed to access your origin database. The API never returns this write-only value.",
		})
		.option("origin-scheme", {
			type: "string",
			description:
				"Specifies the URL scheme used to connect to your origin database.",
			choices: ["postgres", "postgresql", "mysql"],
		})
		.coerce("origin-scheme", (value) =>
			resolveFileToken(value, "origin-scheme", "text")
		)
		.option("origin-user", {
			type: "string",
			description: "Set the user of your origin database.",
		})
		.option("origin-host", {
			type: "string",
			description:
				"Defines the publicly reachable hostname or IP of your origin database. Private, loopback, and link-local IP addresses are not allowed.",
		})
		.option("origin-port", {
			type: "number",
			description:
				"Defines the port of your origin database. Defaults to 5432 for PostgreSQL or 3306 for MySQL if not specified.",
		})
		.option("origin-access-client-id", {
			type: "string",
			description:
				"Defines the Client ID of the Access token to use when connecting to the origin database.",
		})
		.option("origin-access-client-secret", {
			type: "string",
			description:
				"Defines the Client Secret of the Access Token to use when connecting to the origin database. The API never returns this write-only value.",
		})
		.option("origin-service-id", {
			type: "string",
			description:
				"The identifier of the Workers VPC Service to connect through. Hyperdrive will egress through the specified VPC Service to reach the origin database.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"A request to create a Hyperdrive configuration using exactly one of caller-supplied origin credentials or a managed integration.",
		})
		.conflicts("origin-host", ["origin-service-id"])
		.conflicts("origin-port", [
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		])
		.implies("origin-port", ["origin-host"])
		.conflicts("origin-access-client-id", ["origin-port", "origin-service-id"])
		.implies("origin-access-client-id", [
			"origin-access-client-secret",
			"origin-host",
		])
		.conflicts("origin-access-client-secret", [
			"origin-port",
			"origin-service-id",
		])
		.implies("origin-access-client-secret", [
			"origin-access-client-id",
			"origin-host",
		])
		.conflicts("origin-service-id", [
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
		])
		.check((argv) => {
			const groupSet = [
				"origin-database",
				"origin-password",
				"origin-scheme",
				"origin-user",
				"origin-host",
				"origin-port",
				"origin-access-client-id",
				"origin-access-client-secret",
				"origin-service-id",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"origin-database",
					"origin-password",
					"origin-scheme",
					"origin-user",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --origin-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Hyperdrive",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API."
					);
				}

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
};

export default command;
