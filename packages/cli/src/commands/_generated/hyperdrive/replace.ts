import operation from "../_operations/hyperdrive/replace.js";
/**
 * replace command
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
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "replace <hyperdrive-id>",
	describe: "Replace Hyperdrive",
	usage:
		"$0 hyperdrive replace <hyperdrive-id>\n\nReplaces and returns the specified Hyperdrive configuration. The request must include the name and complete origin connection details. Omitted caching settings are reset to their defaults, while omitted mTLS settings and origin connection limits are preserved. The integration association is set only during creation and cannot be changed; omit the integration field even when replacing an integration-backed configuration. Use the update operation to modify only selected fields.",
	flags: {
		"caching-disabled": {
			kind: "boolean",
			brief:
				"Set to true to disable caching of SQL responses. Default is false.",
			optional: true,
		},
		"caching-max-age": {
			kind: "parsed",
			brief:
				"Specify the maximum duration (in seconds) items should persist in the cache. Defaults to 60 seconds if not specified.",
			optional: true,
			parse: Number,
		},
		"caching-stale-while-revalidate": {
			kind: "parsed",
			brief:
				"Specify the number of seconds the cache may serve a stale response. Defaults to 15 seconds if not specified.",
			optional: true,
			parse: Number,
		},
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
		"origin-connection-limit": {
			kind: "parsed",
			brief:
				"The (soft) maximum number of connections the Hyperdrive is allowed to make to the origin database.\n\nMaximum allowed: 20 for free tier accounts, 100 for paid tier accounts.\nIf not specified, defaults to 20 for free tier and 60 for paid tier.\nCertain Cloudflare-managed origins may be permitted a higher limit.\nContact Cloudflare if you need a higher limit.\n",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "hyperdrive-id",
			brief: "The unique identifier of the Hyperdrive configuration.",
			parse: String,
		},
	],
	rules(rules) {
		rules.conflicts("origin-host", ["origin-service-id"]);
		rules.conflicts("origin-port", [
			"origin-access-client-id",
			"origin-access-client-secret",
			"origin-service-id",
		]);
		rules.implies("origin-port", ["origin-host"]);
		rules.conflicts("origin-access-client-id", [
			"origin-port",
			"origin-service-id",
		]);
		rules.implies("origin-access-client-id", [
			"origin-host",
			"origin-access-client-secret",
		]);
		rules.conflicts("origin-access-client-secret", [
			"origin-port",
			"origin-service-id",
		]);
		rules.implies("origin-access-client-secret", [
			"origin-host",
			"origin-access-client-id",
		]);
		rules.conflicts("origin-service-id", [
			"origin-host",
			"origin-port",
			"origin-access-client-id",
			"origin-access-client-secret",
		]);
	},
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
		),
});

export default command;
