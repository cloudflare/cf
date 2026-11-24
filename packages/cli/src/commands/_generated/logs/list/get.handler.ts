import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
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
			command: "logs list get",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				start: argv["start"],
				end: argv["end"],
				bucket: argv["bucket"],
				prefix: argv["prefix"],
				limit: argv["limit"],
			};

			const headers: Record<string, string> = {};
			if (argv["r2-access-key-id"] !== undefined)
				headers["R2-Access-Key-Id"] = String(argv["r2-access-key-id"]);
			if (argv["r2-secret-access-key"] !== undefined)
				headers["R2-Secret-Access-Key"] = String(argv["r2-secret-access-key"]);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf logs list get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/logs/list`,
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
				requestApi<unknown>(client, "GET", `/accounts/${accountId}/logs/list`, {
					query: queryParams,
					headers: Object.keys(headers).length > 0 ? headers : undefined,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
