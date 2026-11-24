import operation from "../_operations/hyperdrive/edit.js";
/**
 * edit command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <hyperdrive-id>",
	describe: "Update Hyperdrive",
	usage:
		"$0 hyperdrive edit <hyperdrive-id>\n\nUpdates and returns the specified fields of the Hyperdrive configuration. Custom caching settings are not kept if caching is disabled. For an integration-backed configuration, the integration association is preserved but cannot be changed; omit the integration field.",
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
				"The name of the Hyperdrive configuration. Used to identify the configuration in the Cloudflare dashboard and API. An empty value leaves the name unchanged.",
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
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "hyperdrive edit",
				classification: {
					safeFlags: ["caching-disabled", "mtls-sslmode", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf hyperdrive edit",
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
											sslmode: argv["mtls-sslmode"],
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
