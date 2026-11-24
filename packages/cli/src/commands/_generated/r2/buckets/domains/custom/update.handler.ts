import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "r2 buckets domains custom update",
			classification: {
				safeFlags: ["enabled", "min-tls", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const headers: Record<string, string> = {};
			if (argv["cf-r2-jurisdiction"] !== undefined)
				headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf r2 buckets domains custom update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/domains/custom/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}`,
					pathParams: {
						"bucket-name": String(argv["bucket-name"] ?? ""),
						domain: String(argv["domain"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									ciphers: argv["ciphers"],
									enabled: argv["enabled"],
									minTLS: argv["min-tls"],
								}),
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
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/domains/custom/${encodeURIComponent(String(argv["domain"]))}`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["ciphers"] !== undefined)
				setNestedValue(bodyData, ["ciphers"], argv["ciphers"]);
			if (argv["enabled"] !== undefined)
				setNestedValue(bodyData, ["enabled"], argv["enabled"]);
			if (argv["min-tls"] !== undefined)
				setNestedValue(bodyData, ["minTLS"], argv["min-tls"]);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/domains/custom/${encodeURIComponent(String(argv["domain"]))}`,
					{
						body: bodyData,
						headers: Object.keys(headers).length > 0 ? headers : undefined,
					}
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
