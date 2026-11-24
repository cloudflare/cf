import operation from "../../../_operations/zero-trust/access/saml-encryption-certificates/rotate.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./rotate.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust access saml-encryption-certificates rotate",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust access saml-encryption-certificates rotate",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/saml_certificates/${argv["saml-cert-set-id"] == null ? "<saml-cert-set-id>" : encodeURIComponent(String(argv["saml-cert-set-id"]))}/rotate`,
					pathParams: {
						"saml-cert-set-id": String(argv["saml-cert-set-id"] ?? ""),
					},
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					account_id: accountId,
					saml_cert_set_id: argv["saml-cert-set-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
