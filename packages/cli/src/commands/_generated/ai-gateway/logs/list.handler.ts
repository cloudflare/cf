import operation from "../../_operations/ai-gateway/logs/list.js";
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
			command: "ai-gateway logs list",
			classification: {
				safeFlags: [
					"order-by",
					"order-by-direction",
					"meta-info",
					"direction",
					"feedback",
					"success",
					"cached",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				search: argv["search"],
				page: argv["page"],
				per_page: argv["per-page"],
				order_by: argv["order-by"],
				order_by_direction: argv["order-by-direction"],
				filters: argv["filters"],
				meta_info: argv["meta-info"],
				direction: argv["direction"],
				start_date: argv["start-date"],
				end_date: argv["end-date"],
				min_cost: argv["min-cost"],
				max_cost: argv["max-cost"],
				min_tokens_in: argv["min-tokens-in"],
				max_tokens_in: argv["max-tokens-in"],
				min_tokens_out: argv["min-tokens-out"],
				max_tokens_out: argv["max-tokens-out"],
				min_total_tokens: argv["min-total-tokens"],
				max_total_tokens: argv["max-total-tokens"],
				min_duration: argv["min-duration"],
				max_duration: argv["max-duration"],
				feedback: argv["feedback"],
				success: argv["success"],
				cached: argv["cached"],
				model: argv["model"],
				model_type: argv["model-type"],
				provider: argv["ai-gateway-provider"],
				request_content_type: argv["request-content-type"],
				response_content_type: argv["response-content-type"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-gateway logs list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/logs`,
					pathParams: { "gateway-id": String(argv["gateway-id"] ?? "") },
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					account_id: accountId,
					gateway_id: argv["gateway-id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
