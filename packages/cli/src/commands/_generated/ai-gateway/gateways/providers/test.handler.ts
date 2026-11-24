import operation from "../../../_operations/ai-gateway/gateways/providers/test.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./test.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ai-gateway gateways providers test",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-gateway gateways providers test",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/provider_configs/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/test`,
					pathParams: {
						"gateway-id": String(argv["gateway-id"] ?? ""),
						id: String(argv["id"] ?? ""),
					},
					bodyKind: "json",
					body: argv.body !== undefined ? parseBody(argv.body) : undefined,
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined ? parseBody(argv.body) : undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						gateway_id: argv["gateway-id"],
						id: argv["id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/ai-gateway/gateways/${encodeURIComponent(String(argv["gateway-id"]))}/provider_configs/${encodeURIComponent(String(argv["id"]))}/test`
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
