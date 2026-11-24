import operation from "../../../_operations/builds/repos/config-autofill/get.js";
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
			command: "builds repos config-autofill get",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				branch: argv["branch"],
				root_directory: argv["root-directory"],
			};
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf builds repos config-autofill get",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/repos/${argv["provider-type"] == null ? "<provider-type>" : encodeURIComponent(String(argv["provider-type"]))}/${argv["provider-account-id"] == null ? "<provider-account-id>" : encodeURIComponent(String(argv["provider-account-id"]))}/${argv["repo-id"] == null ? "<repo-id>" : encodeURIComponent(String(argv["repo-id"]))}/config_autofill`,
					pathParams: {
						"provider-type": String(argv["provider-type"] ?? ""),
						"provider-account-id": String(argv["provider-account-id"] ?? ""),
						"repo-id": String(argv["repo-id"] ?? ""),
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
					provider_type: argv["provider-type"],
					provider_account_id: argv["provider-account-id"],
					repo_id: argv["repo-id"],
					...queryParams,
				})
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
