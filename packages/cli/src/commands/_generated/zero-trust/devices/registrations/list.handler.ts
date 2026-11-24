import operation from "../../../_operations/zero-trust/devices/registrations/list.js";
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
			command: "zero-trust devices registrations list",
			classification: {
				safeFlags: [
					"status",
					"registration-type",
					"sort-by",
					"sort-order",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				"user.id": argv["user-id"],
				seen_after: argv["seen-after"],
				seen_before: argv["seen-before"],
				status: argv["status"],
				registration_type: argv["registration-type"],
				per_page: argv["per-page"],
				search: argv["search"],
				sort_by: argv["sort-by"],
				sort_order: argv["sort-order"],
				cursor: argv["cursor"],
				id: argv["id"],
				"device.id": argv["device-id"],
				"policy.id": argv["policy-id"],
				include: argv["include"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust devices registrations list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/registrations`,
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
