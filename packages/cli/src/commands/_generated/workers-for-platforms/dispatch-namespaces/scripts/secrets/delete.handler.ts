import operation from "../../../../_operations/workers-for-platforms/dispatch-namespaces/scripts/secrets/delete.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command:
				"workers-for-platforms dispatch-namespaces scripts secrets delete",
			classification: {
				safeFlags: ["url-encoded", "dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				url_encoded: argv["url-encoded"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command:
						"cf workers-for-platforms dispatch-namespaces scripts secrets delete",
					method: "DELETE",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/secrets/${argv["secret-name"] == null ? "<secret-name>" : encodeURIComponent(String(argv["secret-name"]))}`,
					pathParams: {
						"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
						"script-name": String(argv["script-name"] ?? ""),
						"secret-name": String(argv["secret-name"] ?? ""),
					},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `This will permanently delete the Workers for Platforms script secret.`,
				}))
			) {
				return;
			}

			const result = await withProgress(`Deleting`, async () =>
				client.send(operation, {
					account_id: accountId,
					dispatch_namespace: argv["dispatch-namespace"],
					script_name: argv["script-name"],
					secret_name: argv["secret-name"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
