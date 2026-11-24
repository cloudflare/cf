import operation from "../../../../_operations/zero-trust/access/infrastructure/ssh-ca/delete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust access infrastructure ssh-ca delete",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust access infrastructure ssh-ca delete",
					method: "DELETE",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/gateway_ca/${argv["certificate-id"] == null ? "<certificate-id>" : encodeURIComponent(String(argv["certificate-id"]))}`,
					pathParams: {
						"certificate-id": String(argv["certificate-id"] ?? ""),
					},
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
				return;
			}

			const result = await withProgress(`Deleting`, async () =>
				client.send(operation, {
					account_id: accountId,
					certificate_id: argv["certificate-id"],
				})
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
