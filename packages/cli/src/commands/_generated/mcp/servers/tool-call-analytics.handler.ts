import operation from "../../_operations/mcp/servers/tool-call-analytics.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./tool-call-analytics.js";
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
			command: "mcp servers tool-call-analytics",
			classification: {
				safeFlags: ["granularity", "aggregate", "response-status", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				granularity: argv["granularity"],
				aggregate: argv["aggregate"],
				tz: argv["tz"],
				days: argv["days"],
				response_status: argv["response-status"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf mcp servers tool-call-analytics",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/ai-controls/mcp/analytics/servers/${argv["server-id"] == null ? "<server-id>" : encodeURIComponent(String(argv["server-id"]))}/tool-calls/timeseries`,
					pathParams: { "server-id": String(argv["server-id"] ?? "") },
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
					server_id: argv["server-id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
