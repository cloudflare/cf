import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * replace command
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 hyperdrive replace <hyperdrive-id>\n\nReplaces and returns the specified Hyperdrive configuration. The request must include the name and complete origin connection details. Omitted caching settings are reset to their defaults, while omitted mTLS settings and origin connection limits are preserved. Use the update operation to modify only selected fields."
		)
		.positional("hyperdrive-id", {
			type: "string",
			description: "The unique identifier of the Hyperdrive configuration.",
			demandOption: true,
		})
		.option("caching-disabled", {
			type: "boolean",
			description:
				"Set to true to disable caching of SQL responses. Default is false.",
		})
		.option("caching-max-age", {
			type: "number",
			description:
				"Specify the maximum duration (in seconds) items should persist in the cache. Defaults to 60 seconds if not specified.",
		})
		.option("caching-stale-while-revalidate", {
			type: "number",
			description:
				"Specify the number of seconds the cache may serve a stale response. Defaults to 15 seconds if not specified.",
		})
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
		.option("name", {
			type: "string",
			description:
				"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API.",
		})
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
		.option("origin-connection-limit", {
			type: "number",
			description:
				"The (soft) maximum number of connections the Hyperdrive is allowed to make to the origin database.\n\nMaximum allowed: 20 for free tier accounts, 100 for paid tier accounts.\nIf not specified, defaults to 20 for free tier and 60 for paid tier.\nCertain Cloudflare-managed origins may be permitted a higher limit.\nContact Cloudflare if you need a higher limit.\n",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
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
			"origin-host",
			"origin-access-client-secret",
		])
		.conflicts("origin-access-client-secret", [
			"origin-port",
			"origin-service-id",
		])
		.implies("origin-access-client-secret", [
			"origin-host",
			"origin-access-client-id",
		])
		.conflicts("origin-service-id", [
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
		]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"update-hyperdrive">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "replace <hyperdrive-id>",
	describe: "Replace Hyperdrive",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "hyperdrive replace",
				classification: {
					safeFlags: [
						"caching-disabled",
						"mtls-sslmode",
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
						command: "cf hyperdrive replace",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/hyperdrive/configs/${argv["hyperdrive-id"] == null ? "<hyperdrive-id>" : encodeURIComponent(String(argv["hyperdrive-id"]))}`,
						pathParams: {
							"hyperdrive-id": String(argv["hyperdrive-id"] ?? ""),
						},
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
											sslmode: resolveFileToken(
												argv["mtls-sslmode"] as string | undefined,
												"mtls-sslmode",
												"text"
											),
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
											scheme: resolveFileToken(
												argv["origin-scheme"] as string | undefined,
												"origin-scheme",
												"text"
											),
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
										origin_connection_limit: argv["origin-connection-limit"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.hyperdrive.replace({
							...bodyData,
							account_id: accountId,
							hyperdrive_id: argv["hyperdrive-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
						sslmode: resolveFileToken(
							argv["mtls-sslmode"] as string | undefined,
							"mtls-sslmode",
							"text"
						),
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
						scheme: resolveFileToken(
							argv["origin-scheme"] as string | undefined,
							"origin-scheme",
							"text"
						),
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
					client.hyperdrive.replace({
						...bodyData,
						account_id: accountId,
						hyperdrive_id: argv["hyperdrive-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
