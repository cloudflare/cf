import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
import { createCommandClient, requestApi } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "organizations accounts list",
			classification: {
				safeFlags: [
					"status",
					"order-by",
					"direction",
					"include-tags",
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
				include_tags: argv["include-tags"],
				include_total: argv["include-total"],
				page_token: argv["page-token"],
				page_size: argv["page-size"],
			};

			const headers: Record<string, string> = {};
			if (argv["accept"] !== undefined)
				headers["Accept"] = String(argv["accept"]);
			if (argv.dryRun) {
				formatDryRun({
					command: "cf organizations accounts list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/accounts`,
					pathParams: {
						"organization-id": String(argv["organization-id"] ?? ""),
					},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);

			const result = await withProgress(`Loading`, async () =>
				requestApi<unknown>(
					client,
					"GET",
					`/organizations/${encodeURIComponent(String(argv["organization-id"]))}/accounts`,
					{
						query: queryParams,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
