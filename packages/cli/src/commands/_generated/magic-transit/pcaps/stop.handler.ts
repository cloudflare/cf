import operation from "../../_operations/magic-transit/pcaps/stop.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./stop.js";
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
			command: "magic-transit pcaps stop",
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
					command: "cf magic-transit pcaps stop",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pcaps/${argv["pcap-id"] == null ? "<pcap-id>" : encodeURIComponent(String(argv["pcap-id"]))}/stop`,
					pathParams: { "pcap-id": String(argv["pcap-id"] ?? "") },
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `This operation halts an in-progress full packet capture. Any unsaved capture data will be lost.`,
				}))
			) {
				return;
			}

			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					account_id: accountId,
					pcap_id: argv["pcap-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
