import operation from "../../_operations/zero-trust/devices/list.js";
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
			command: "zero-trust devices list",
			classification: {
				safeFlags: [
					"sort-by",
					"sort-order",
					"active-registrations",
					"has-registration-type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				cursor: argv["cursor"],
				sort_by: argv["sort-by"],
				sort_order: argv["sort-order"],
				"last_seen_user.email": argv["last-seen-user-email"],
				seen_after: argv["seen-after"],
				seen_before: argv["seen-before"],
				per_page: argv["per-page"],
				search: argv["search"],
				active_registrations: argv["active-registrations"],
				has_registration_type: argv["has-registration-type"],
				id: argv["id"],
				tag: argv["tag"],
				"last_seen_registration.policy.id":
					argv["last-seen-registration-policy-id"],
				include: argv["include"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust devices list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/physical-devices`,
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
