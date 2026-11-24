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
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ai-search namespace update",
			classification: {
				safeFlags: [
					"public-endpoint-params-chat-completions-endpoint-disabled",
					"public-endpoint-params-default-domain-enabled",
					"public-endpoint-params-enabled",
					"public-endpoint-params-mcp-disabled",
					"public-endpoint-params-rate-limit-technique",
					"public-endpoint-params-search-endpoint-disabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-search namespace update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}`,
					pathParams: { namespace: String(argv["namespace"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									public_endpoint_params: {
										authorized_hosts:
											argv["public-endpoint-params-authorized-hosts"],
										chat_completions_endpoint: {
											disabled:
												argv[
													"public-endpoint-params-chat-completions-endpoint-disabled"
												],
										},
										custom_domains:
											argv["public-endpoint-params-custom-domains"],
										default_domain_enabled:
											argv["public-endpoint-params-default-domain-enabled"],
										enabled: argv["public-endpoint-params-enabled"],
										instances_allowed:
											argv["public-endpoint-params-instances-allowed"],
										mcp: {
											description: resolveFileToken(
												argv["public-endpoint-params-mcp-description"] as
													| string
													| undefined,
												"public-endpoint-params-mcp-description",
												"text"
											),
											disabled: argv["public-endpoint-params-mcp-disabled"],
										},
										rate_limit: {
											period_ms:
												argv["public-endpoint-params-rate-limit-period-ms"],
											requests:
												argv["public-endpoint-params-rate-limit-requests"],
											technique:
												argv["public-endpoint-params-rate-limit-technique"],
										},
										search_endpoint: {
											disabled:
												argv["public-endpoint-params-search-endpoint-disabled"],
										},
									},
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
						`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["description"] !== undefined)
				setNestedValue(
					bodyData,
					["description"],
					resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					)
				);
			if (argv["public-endpoint-params-authorized-hosts"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "authorized_hosts"],
					argv["public-endpoint-params-authorized-hosts"]
				);
			if (
				argv["public-endpoint-params-chat-completions-endpoint-disabled"] !==
				undefined
			)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "chat_completions_endpoint", "disabled"],
					argv["public-endpoint-params-chat-completions-endpoint-disabled"]
				);
			if (argv["public-endpoint-params-custom-domains"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "custom_domains"],
					argv["public-endpoint-params-custom-domains"]
				);
			if (argv["public-endpoint-params-default-domain-enabled"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "default_domain_enabled"],
					argv["public-endpoint-params-default-domain-enabled"]
				);
			if (argv["public-endpoint-params-enabled"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "enabled"],
					argv["public-endpoint-params-enabled"]
				);
			if (argv["public-endpoint-params-instances-allowed"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "instances_allowed"],
					argv["public-endpoint-params-instances-allowed"]
				);
			if (argv["public-endpoint-params-mcp-description"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "mcp", "description"],
					resolveFileToken(
						argv["public-endpoint-params-mcp-description"] as
							| string
							| undefined,
						"public-endpoint-params-mcp-description",
						"text"
					)
				);
			if (argv["public-endpoint-params-mcp-disabled"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "mcp", "disabled"],
					argv["public-endpoint-params-mcp-disabled"]
				);
			if (argv["public-endpoint-params-rate-limit-period-ms"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "rate_limit", "period_ms"],
					argv["public-endpoint-params-rate-limit-period-ms"]
				);
			if (argv["public-endpoint-params-rate-limit-requests"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "rate_limit", "requests"],
					argv["public-endpoint-params-rate-limit-requests"]
				);
			if (argv["public-endpoint-params-rate-limit-technique"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "rate_limit", "technique"],
					argv["public-endpoint-params-rate-limit-technique"]
				);
			if (argv["public-endpoint-params-search-endpoint-disabled"] !== undefined)
				setNestedValue(
					bodyData,
					["public_endpoint_params", "search_endpoint", "disabled"],
					argv["public-endpoint-params-search-endpoint-disabled"]
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
