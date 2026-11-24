import operation from "../../_operations/images/keys/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
			command: "images keys create",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf images keys create",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v1/keys/${argv["signing-key-name"] == null ? "<signing-key-name>" : encodeURIComponent(String(argv["signing-key-name"]))}`,
					pathParams: {
						"signing-key-name": String(argv["signing-key-name"] ?? ""),
					},
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					account_id: accountId,
					signing_key_name: argv["signing-key-name"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
