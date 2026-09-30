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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/hyperdrive.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 hyperdrive update <hyperdrive-id>\n\nUpdates and returns the specified fields of the Hyperdrive configuration. Custom caching settings are not kept if caching is disabled."
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
				"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API. An empty value leaves the name unchanged.",
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
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"patch-hyperdrive">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <hyperdrive-id>",
	describe: "Update Hyperdrive",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "hyperdrive update",
				classification: {
					safeFlags: ["caching-disabled", "mtls-sslmode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf hyperdrive update",
						method: "PATCH",
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
						client.hyperdrive.update({
							...bodyData,
							account_id: accountId,
							hyperdrive_id: argv["hyperdrive-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
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
					origin_connection_limit: argv["origin-connection-limit"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.hyperdrive.update({
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
