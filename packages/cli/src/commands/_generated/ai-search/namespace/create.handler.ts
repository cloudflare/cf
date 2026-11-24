import operation from "../../_operations/ai-search/namespace/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	mergeBodyPositionals,
	parseBody,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "ai-search namespace create",
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
					command: "cf ai-search namespace create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? mergeBodyPositionals(parseBody(argv.body), [
									{
										name: "namespace",
										field: "name",
										value: argv["namespace"],
									},
								])
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
									name: argv["namespace"],
								}),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined
					? mergeBodyPositionals(parseBody(argv.body), [
							{ name: "namespace", field: "name", value: argv["namespace"] },
						])
					: undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				public_endpoint_params: {
					authorized_hosts: argv["public-endpoint-params-authorized-hosts"],
					chat_completions_endpoint: {
						disabled:
							argv["public-endpoint-params-chat-completions-endpoint-disabled"],
					},
					custom_domains: argv["public-endpoint-params-custom-domains"],
					default_domain_enabled:
						argv["public-endpoint-params-default-domain-enabled"],
					enabled: argv["public-endpoint-params-enabled"],
					instances_allowed: argv["public-endpoint-params-instances-allowed"],
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
						period_ms: argv["public-endpoint-params-rate-limit-period-ms"],
						requests: argv["public-endpoint-params-rate-limit-requests"],
						technique: argv["public-endpoint-params-rate-limit-technique"],
					},
					search_endpoint: {
						disabled: argv["public-endpoint-params-search-endpoint-disabled"],
					},
				},
				name: argv["namespace"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
