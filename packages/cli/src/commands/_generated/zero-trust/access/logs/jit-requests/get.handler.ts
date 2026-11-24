import operation from "../../../../_operations/zero-trust/access/logs/jit-requests/get.js";
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
			command: "zero-trust access logs jit-requests get",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust access logs jit-requests get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/logs/jit_requests/${argv["knock-request-id"] == null ? "<knock-request-id>" : encodeURIComponent(String(argv["knock-request-id"]))}`,
					pathParams: {
						"knock-request-id": String(argv["knock-request-id"] ?? ""),
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
					knock_request_id: argv["knock-request-id"],
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
