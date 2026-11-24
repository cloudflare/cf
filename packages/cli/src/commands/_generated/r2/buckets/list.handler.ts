import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./list.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "r2 buckets list",
			classification: {
				safeFlags: ["order", "direction", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				name_contains: argv["name-contains"],
				start_after: argv["start-after"],
				per_page: argv["per-page"],
				order: argv["order"],
				direction: argv["direction"],
				cursor: argv["cursor"],
			};

			const headers: Record<string, string> = {};
			if (argv["cf-r2-jurisdiction"] !== undefined)
				headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf r2 buckets list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets`,
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
				requestApi<unknown>(
					client,
					"GET",
					`/accounts/${accountId}/r2/buckets`,
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
