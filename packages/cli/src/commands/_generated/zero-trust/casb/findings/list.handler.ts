import operation from "../../../_operations/zero-trust/casb/findings/list.js";
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
			command: "zero-trust casb findings list",
			classification: {
				safeFlags: [
					"direction",
					"ignored",
					"observation",
					"order",
					"product",
					"severity",
					"type",
					"vendor",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				cursor: argv["cursor"],
				direction: argv["direction"],
				ignored: argv["ignored"],
				integration_id: argv["integration-id"],
				max_affliction_date: argv["max-affliction-date"],
				min_affliction_date: argv["min-affliction-date"],
				observation: argv["observation"],
				order: argv["order"],
				page: argv["page"],
				per_page: argv["per-page"],
				product: argv["product"],
				search: argv["search"],
				severity: argv["severity"],
				type: argv["type"],
				vendor: argv["vendor"],
				finding_type_ids: argv["finding-type-ids"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust casb findings list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/findings`,
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
