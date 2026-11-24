import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
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
			command: "magic-transit ipsec-tunnels delete",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["x-magic-new-hc-target"] !== undefined)
				headers["x-magic-new-hc-target"] = String(
					argv["x-magic-new-hc-target"]
				);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf magic-transit ipsec-tunnels delete",
					method: "DELETE",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/ipsec_tunnels/${argv["ipsec-tunnel-id"] == null ? "<ipsec-tunnel-id>" : encodeURIComponent(String(argv["ipsec-tunnel-id"]))}`,
					pathParams: {
						"ipsec-tunnel-id": String(argv["ipsec-tunnel-id"] ?? ""),
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
				requestApi<unknown>(
					client,
					"DELETE",
					`/accounts/${accountId}/magic/ipsec_tunnels/${encodeURIComponent(String(argv["ipsec-tunnel-id"]))}`,
					{ headers: Object.keys(headers).length > 0 ? headers : undefined }
				)
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
