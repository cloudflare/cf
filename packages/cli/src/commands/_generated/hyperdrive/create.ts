import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
		.coerce("mtls-sslmode", (value: string | undefined) =>
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
		.coerce("integration-provider", (value: string | undefined) =>
			resolveFileToken(value, "integration-provider", "text")
		)
		.option("integration-scheme", {
			type: "string",
			description:
				"Specifies the URL scheme used to connect to your origin database.",
			choices: ["postgres", "postgresql", "mysql"],
		})
		.coerce("integration-scheme", (value: string | undefined) =>
			resolveFileToken(value, "integration-scheme", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"A request to create a Hyperdrive configuration using exactly one of caller-supplied origin credentials or a managed integration.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"create-hyperdrive">;
type Body = Request["body"];

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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.hyperdrive.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
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
				const bodyData = compactBody<Body>({
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.hyperdrive.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
