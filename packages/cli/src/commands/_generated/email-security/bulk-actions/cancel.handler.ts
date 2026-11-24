import operation from "../../_operations/email-security/bulk-actions/cancel.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./cancel.js";
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
			command: "email-security bulk-actions cancel",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-security bulk-actions cancel",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate/bulk/${argv["job-id"] == null ? "<job-id>" : encodeURIComponent(String(argv["job-id"]))}/cancel`,
					pathParams: { "job-id": String(argv["job-id"] ?? "") },
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					account_id: accountId,
					job_id: argv["job-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
