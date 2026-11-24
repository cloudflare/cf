import operation from "../../_operations/email-security/domains/edit.js";
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
			command: "email-security domains edit",
			classification: {
				safeFlags: [
					"folder",
					"require-tls-inbound",
					"require-tls-outbound",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-security domains edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/domains/${argv["domain-id"] == null ? "<domain-id>" : encodeURIComponent(String(argv["domain-id"]))}`,
					pathParams: { "domain-id": String(argv["domain-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									allowed_delivery_modes: argv["allowed-delivery-modes"],
									drop_dispositions: argv["drop-dispositions"],
									folder: argv["folder"],
									integration_id: resolveFileToken(
										argv["integration-id"] as string | undefined,
										"integration-id",
										"text"
									),
									ip_restrictions: argv["ip-restrictions"],
									lookback_hops: argv["lookback-hops"],
									regions: argv["regions"],
									require_tls_inbound: argv["require-tls-inbound"],
									require_tls_outbound: argv["require-tls-outbound"],
									transport: resolveFileToken(
										argv["transport"] as string | undefined,
										"transport",
										"text"
									),
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
						domain_id: argv["domain-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				allowed_delivery_modes: argv["allowed-delivery-modes"],
				drop_dispositions: argv["drop-dispositions"],
				folder: argv["folder"],
				integration_id: resolveFileToken(
					argv["integration-id"] as string | undefined,
					"integration-id",
					"text"
				),
				ip_restrictions: argv["ip-restrictions"],
				lookback_hops: argv["lookback-hops"],
				regions: argv["regions"],
				require_tls_inbound: argv["require-tls-inbound"],
				require_tls_outbound: argv["require-tls-outbound"],
				transport: resolveFileToken(
					argv["transport"] as string | undefined,
					"transport",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					domain_id: argv["domain-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
