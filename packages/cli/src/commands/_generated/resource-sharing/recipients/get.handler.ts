import operation from "../../_operations/resource-sharing/recipients/get.js";
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
			command: "resource-sharing recipients get",
			classification: {
				safeFlags: ["include-resources", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				include_resources: argv["include-resources"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf resource-sharing recipients get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/recipients/${argv["recipient-id"] == null ? "<recipient-id>" : encodeURIComponent(String(argv["recipient-id"]))}`,
					pathParams: {
						"share-id": String(argv["share-id"] ?? ""),
						"recipient-id": String(argv["recipient-id"] ?? ""),
					},
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
					share_id: argv["share-id"],
					recipient_id: argv["recipient-id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
