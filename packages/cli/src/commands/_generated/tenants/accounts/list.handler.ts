import operation from "../../_operations/tenants/accounts/list.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "tenants accounts list",
			classification: {
				safeFlags: [
					"status",
					"order-by",
					"direction",
					"include-total",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				account_pubname: argv["account-pubname"],
				"account_pubname.startsWith": argv["account-pubname-starts-with"],
				"account_pubname.endsWith": argv["account-pubname-ends-with"],
				"account_pubname.contains": argv["account-pubname-contains"],
				name: argv["name"],
				"name.startsWith": argv["name-starts-with"],
				"name.endsWith": argv["name-ends-with"],
				"name.contains": argv["name-contains"],
				status: argv["status"],
				order_by: argv["order-by"],
				direction: argv["direction"],
				include_total: argv["include-total"],
				page_token: argv["page-token"],
				page_size: argv["page-size"],
			};
			if (argv.dryRun) {
				formatDryRun({
					command: "cf tenants accounts list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/tenants/${argv["tenant-id"] == null ? "<tenant-id>" : encodeURIComponent(String(argv["tenant-id"]))}/accounts`,
					pathParams: { "tenant-id": String(argv["tenant-id"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, { tenant_id: argv["tenant-id"], ...queryParams })
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
