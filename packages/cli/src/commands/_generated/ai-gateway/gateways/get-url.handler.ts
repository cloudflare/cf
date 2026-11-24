import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./get-url.js";
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
			command: "ai-gateway gateways get-url",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-gateway gateways get-url",
					method: "GET",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/url/${argv["ai-gateway-provider"] == null ? "<ai-gateway-provider>" : encodeURIComponent(String(argv["ai-gateway-provider"]))}`,
					pathParams: {
						"gateway-id": String(argv["gateway-id"] ?? ""),
						"ai-gateway-provider": String(argv["ai-gateway-provider"] ?? ""),
					},
					bodyKind: "none",
				});
				return;
			}
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			const result = await withProgress(`Loading`, async () =>
				requestApi<unknown>(
					client,
					"GET",
					`/accounts/${accountId}/ai-gateway/gateways/${encodeURIComponent(String(argv["gateway-id"]))}/url/${encodeURIComponent(String(argv["ai-gateway-provider"]))}`
				)
			);
			formatOutput(result, { successLabel: `Loaded` });
		}
	);
}
