import operation from "../../../_operations/cloudforce-one/requests/messages/get.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
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
			command: "cloudforce-one requests messages get",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one requests messages get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}/${argv["request-id"] == null ? "<request-id>" : encodeURIComponent(String(argv["request-id"]))}/messages/${argv["message-id"] == null ? "<message-id>" : encodeURIComponent(String(argv["message-id"]))}`,
					pathParams: {
						"project-type": String(argv["project-type"] ?? ""),
						"request-id": String(argv["request-id"] ?? ""),
						"message-id": String(argv["message-id"] ?? ""),
					},
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
					project_type: argv["project-type"],
					request_id: argv["request-id"],
					message_id: argv["message-id"],
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
