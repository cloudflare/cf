import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./delete.js";
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "workers-for-platforms dispatch-namespaces scripts tags delete",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["api-version"] !== undefined)
				headers["api-version"] = String(argv["api-version"]);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command:
						"cf workers-for-platforms dispatch-namespaces scripts tags delete",
					method: "DELETE",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/tags/${argv["tag"] == null ? "<tag>" : encodeURIComponent(String(argv["tag"]))}`,
					pathParams: {
						"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
						"script-name": String(argv["script-name"] ?? ""),
						tag: String(argv["tag"] ?? ""),
					},
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
					message: `This will delete the tag from the Workers for Platforms script.`,
				}))
			) {
				return;
			}

			const result = await withProgress(`Deleting`, async () =>
				requestApi<unknown>(
					client,
					"DELETE",
					`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}/tags/${encodeURIComponent(String(argv["tag"]))}`,
					{ headers: Object.keys(headers).length > 0 ? headers : undefined }
				)
			);
			formatOutput(result, { successLabel: `Deleted` });
		}
	);
}
