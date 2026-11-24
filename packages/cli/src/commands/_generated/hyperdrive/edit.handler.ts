import operation from "../_operations/hyperdrive/edit.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./edit.js";
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
	);
}
