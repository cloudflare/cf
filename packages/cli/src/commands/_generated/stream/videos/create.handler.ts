import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "stream videos create",
			classification: {
				safeFlags: ["direct-user", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const queryParams: Record<string, unknown> = {
				direct_user: argv["direct-user"],
			};

			const headers: Record<string, string> = {};
			if (argv["tus-resumable"] !== undefined)
				headers["Tus-Resumable"] = String(argv["tus-resumable"]);
			if (argv["upload-creator"] !== undefined)
				headers["Upload-Creator"] = String(argv["upload-creator"]);
			if (argv["upload-length"] !== undefined)
				headers["Upload-Length"] = String(argv["upload-length"]);
			if (argv["upload-metadata"] !== undefined)
				headers["Upload-Metadata"] = String(argv["upload-metadata"]);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf stream videos create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream`,
					pathParams: {},
					query: queryParams,
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(client, "POST", `/accounts/${accountId}/stream`, {
					query: queryParams,
					headers: Object.keys(headers).length > 0 ? headers : undefined,
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
