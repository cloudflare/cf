import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./chat-completions.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
	setNestedValue,
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
			command: "ai-search chat-completions",
			classification: {
				safeFlags: [
					"ai-search-options-cache-cache-threshold",
					"ai-search-options-cache-enabled",
					"ai-search-options-query-rewrite-enabled",
					"ai-search-options-reranking-enabled",
					"ai-search-options-retrieval-fusion-method",
					"ai-search-options-retrieval-keyword-match-mode",
					"ai-search-options-retrieval-retrieval-type",
					"ai-search-options-retrieval-return-on-failure",
					"stream",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["messages"] === undefined) {
					throw new Error(
						"--messages is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-search chat-completions",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/chat/completions`,
					pathParams: {
						namespace: String(argv["namespace"] ?? ""),
						"instance-id": String(argv["instance-id"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										ai_search_options: {
											cache: {
												cache_threshold:
													argv["ai-search-options-cache-cache-threshold"],
												enabled: argv["ai-search-options-cache-enabled"],
											},
											custom_metadata: parseJsonMap(
												argv["ai-search-options-custom-metadata"],
												"ai-search-options-custom-metadata"
											),
											query_rewrite: {
												enabled:
													argv["ai-search-options-query-rewrite-enabled"],
												model: resolveFileToken(
													argv["ai-search-options-query-rewrite-model"] as
														| string
														| undefined,
													"ai-search-options-query-rewrite-model",
													"text"
												),
												rewrite_prompt: resolveFileToken(
													argv[
														"ai-search-options-query-rewrite-rewrite-prompt"
													] as string | undefined,
													"ai-search-options-query-rewrite-rewrite-prompt",
													"text"
												),
											},
											reranking: {
												enabled: argv["ai-search-options-reranking-enabled"],
												match_threshold:
													argv["ai-search-options-reranking-match-threshold"],
												model: resolveFileToken(
													argv["ai-search-options-reranking-model"] as
														| string
														| undefined,
													"ai-search-options-reranking-model",
													"text"
												),
											},
											retrieval: {
												boost_by: parseObjectArray(
													argv["ai-search-options-retrieval-boost-by"],
													"ai-search-options-retrieval-boost-by"
												),
												context_expansion:
													argv["ai-search-options-retrieval-context-expansion"],
												filters: parseJsonMap(
													argv["ai-search-options-retrieval-filters"],
													"ai-search-options-retrieval-filters"
												),
												fusion_method:
													argv["ai-search-options-retrieval-fusion-method"],
												keyword_match_mode:
													argv[
														"ai-search-options-retrieval-keyword-match-mode"
													],
												match_threshold:
													argv["ai-search-options-retrieval-match-threshold"],
												max_num_results:
													argv["ai-search-options-retrieval-max-num-results"],
												retrieval_type:
													argv["ai-search-options-retrieval-retrieval-type"],
												return_on_failure:
													argv["ai-search-options-retrieval-return-on-failure"],
											},
										},
										messages: parseObjectArray(argv["messages"], "messages"),
										model: resolveFileToken(
											argv["model"] as string | undefined,
											"model",
											"text"
										),
										stream: argv["stream"],
									},
									[
										["ai_search_options", "custom_metadata"],
										["ai_search_options", "retrieval", "filters"],
									]
								),
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
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/chat/completions`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}
			await resolveRequiredFields();

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["ai-search-options-cache-cache-threshold"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "cache", "cache_threshold"],
					argv["ai-search-options-cache-cache-threshold"]
				);
			if (argv["ai-search-options-cache-enabled"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "cache", "enabled"],
					argv["ai-search-options-cache-enabled"]
				);
			if (argv["ai-search-options-custom-metadata"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "custom_metadata"],
					parseJsonMap(
						argv["ai-search-options-custom-metadata"],
						"ai-search-options-custom-metadata"
					)
				);
			if (argv["ai-search-options-query-rewrite-enabled"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "query_rewrite", "enabled"],
					argv["ai-search-options-query-rewrite-enabled"]
				);
			if (argv["ai-search-options-query-rewrite-model"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "query_rewrite", "model"],
					resolveFileToken(
						argv["ai-search-options-query-rewrite-model"] as string | undefined,
						"ai-search-options-query-rewrite-model",
						"text"
					)
				);
			if (argv["ai-search-options-query-rewrite-rewrite-prompt"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "query_rewrite", "rewrite_prompt"],
					resolveFileToken(
						argv["ai-search-options-query-rewrite-rewrite-prompt"] as
							| string
							| undefined,
						"ai-search-options-query-rewrite-rewrite-prompt",
						"text"
					)
				);
			if (argv["ai-search-options-reranking-enabled"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "reranking", "enabled"],
					argv["ai-search-options-reranking-enabled"]
				);
			if (argv["ai-search-options-reranking-match-threshold"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "reranking", "match_threshold"],
					argv["ai-search-options-reranking-match-threshold"]
				);
			if (argv["ai-search-options-reranking-model"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "reranking", "model"],
					resolveFileToken(
						argv["ai-search-options-reranking-model"] as string | undefined,
						"ai-search-options-reranking-model",
						"text"
					)
				);
			if (argv["ai-search-options-retrieval-boost-by"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "boost_by"],
					parseObjectArray(
						argv["ai-search-options-retrieval-boost-by"],
						"ai-search-options-retrieval-boost-by"
					)
				);
			if (argv["ai-search-options-retrieval-context-expansion"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "context_expansion"],
					argv["ai-search-options-retrieval-context-expansion"]
				);
			if (argv["ai-search-options-retrieval-filters"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "filters"],
					parseJsonMap(
						argv["ai-search-options-retrieval-filters"],
						"ai-search-options-retrieval-filters"
					)
				);
			if (argv["ai-search-options-retrieval-fusion-method"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "fusion_method"],
					argv["ai-search-options-retrieval-fusion-method"]
				);
			if (argv["ai-search-options-retrieval-keyword-match-mode"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "keyword_match_mode"],
					argv["ai-search-options-retrieval-keyword-match-mode"]
				);
			if (argv["ai-search-options-retrieval-match-threshold"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "match_threshold"],
					argv["ai-search-options-retrieval-match-threshold"]
				);
			if (argv["ai-search-options-retrieval-max-num-results"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "max_num_results"],
					argv["ai-search-options-retrieval-max-num-results"]
				);
			if (argv["ai-search-options-retrieval-retrieval-type"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "retrieval_type"],
					argv["ai-search-options-retrieval-retrieval-type"]
				);
			if (argv["ai-search-options-retrieval-return-on-failure"] !== undefined)
				setNestedValue(
					bodyData,
					["ai_search_options", "retrieval", "return_on_failure"],
					argv["ai-search-options-retrieval-return-on-failure"]
				);
			if (argv["messages"] !== undefined)
				setNestedValue(
					bodyData,
					["messages"],
					parseObjectArray(argv["messages"], "messages")
				);
			if (argv["model"] !== undefined)
				setNestedValue(
					bodyData,
					["model"],
					resolveFileToken(argv["model"] as string | undefined, "model", "text")
				);
			if (argv["stream"] !== undefined)
				setNestedValue(bodyData, ["stream"], argv["stream"]);
			const result = await withProgress(`Creating`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/chat/completions`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
