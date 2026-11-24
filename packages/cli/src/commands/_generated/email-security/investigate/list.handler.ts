import operation from "../../_operations/email-security/investigate/list.js";
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
			command: "email-security investigate list",
			classification: {
				safeFlags: [
					"detections-only",
					"final-disposition",
					"message-action",
					"delivery-status",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				start: argv["start"],
				end: argv["end"],
				query: argv["query"],
				detections_only: argv["detections-only"],
				final_disposition: argv["final-disposition"],
				metric: argv["metric"],
				message_action: argv["message-action"],
				recipient: argv["recipient"],
				sender: argv["sender"],
				smtp_helo_ip: argv["smtp-helo-ip"],
				alert_id: argv["alert-id"],
				domain: argv["domain"],
				message_id: argv["message-id"],
				subject: argv["subject"],
				delivery_status: argv["delivery-status"],
				cursor: argv["cursor"],
				per_page: argv["per-page"],
				page: argv["page"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf email-security investigate list",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/investigate`,
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
