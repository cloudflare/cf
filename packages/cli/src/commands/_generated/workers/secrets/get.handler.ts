import operation from "../../_operations/workers/secrets/get.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get.js";
import {
	createCommandClient,
	getAccountId,
	getWorkerName,
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
			command: "workers secrets get",
			classification: {
				safeFlags: ["url-encoded", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const scriptName = await getWorkerName({
				scriptName: argv["worker"],
				quiet: argv["quiet"] as boolean | undefined,
			});
			argv["worker"] = scriptName;

			const queryParams: Record<string, unknown> = {
				url_encoded: argv["url-encoded"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf workers secrets get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/scripts/${encodeURIComponent(scriptName)}/secrets/${argv["secret-name"] == null ? "<secret-name>" : encodeURIComponent(String(argv["secret-name"]))}`,
					pathParams: {
						worker: String(argv["worker"] ?? ""),
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

			const result = await withProgress(`Loading`, async () =>
				client.send(operation, {
					account_id: accountId,
					script_name: scriptName,
					secret_name: argv["secret-name"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
