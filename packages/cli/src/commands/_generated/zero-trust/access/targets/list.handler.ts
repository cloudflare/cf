import operation from "../../../_operations/zero-trust/access/targets/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
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
			command: "zero-trust access targets list",
			classification: {
				safeFlags: ["order", "direction", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				hostname: argv["hostname"],
				hostname_contains: argv["hostname-contains"],
				virtual_network_id: argv["virtual-network-id"],
				ip_v4: argv["ip-v4"],
				ip_v6: argv["ip-v6"],
				created_before: argv["created-before"],
				created_after: argv["created-after"],
				modified_before: argv["modified-before"],
				modified_after: argv["modified-after"],
				ips: argv["ips"],
				target_ids: argv["target-ids"],
				ip_like: argv["ip-like"],
				ipv4_start: argv["ipv4-start"],
				ipv4_end: argv["ipv4-end"],
				ipv6_start: argv["ipv6-start"],
				ipv6_end: argv["ipv6-end"],
				tag: argv["tag"],
				page: argv["page"],
				per_page: argv["per-page"],
				order: argv["order"],
				direction: argv["direction"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust access targets list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/infrastructure/targets`,
					pathParams: {},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { account_id: accountId, ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
