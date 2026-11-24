import operation from "../_operations/ai-search/create.js";
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
	parseJsonMap,
	parseObjectArray,
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
			command: "ai-search create",
			classification: {
				safeFlags: [
					"cache",
					"cache-threshold",
					"chunk",
					"fusion-method",
					"hybrid-search-enabled",
					"index-method-keyword",
					"index-method-vector",
					"indexing-options-file-summary",
					"indexing-options-keyword-tokenizer",
					"indexing-options-use-ocr",
					"metadata-created-from-aisearch-wizard",
					"metadata-created-from-emdash-plugin-type",
					"public-endpoint-params-chat-completions-endpoint-disabled",
					"public-endpoint-params-default-domain-enabled",
					"public-endpoint-params-enabled",
					"public-endpoint-params-mcp-disabled",
					"public-endpoint-params-rate-limit-technique",
					"public-endpoint-params-search-endpoint-disabled",
					"reranking",
					"retrieval-options-keyword-match-mode",
					"rewrite-query",
					"source-params-d1-template",
					"source-params-web-crawler-discover-options-include-external-links",
					"source-params-web-crawler-discover-options-include-subdomains",
					"source-params-web-crawler-discover-options-source",
					"source-params-web-crawler-parse-options-include-images",
					"source-params-web-crawler-parse-options-use-browser-rendering",
					"source-params-web-crawler-parse-type",
					"type",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf ai-search create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances`,
					pathParams: { namespace: String(argv["namespace"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? mergeBodyPositionals(parseBody(argv.body), [
									{ name: "id", field: "id", value: argv["id"] },
								])
							: compactBody(
									{
										ai_gateway_id: resolveFileToken(
											argv["ai-gateway-id"] as string | undefined,
											"ai-gateway-id",
											"text"
										),
										ai_search_model: resolveFileToken(
											argv["ai-search-model"] as string | undefined,
											"ai-search-model",
											"text"
										),
										cache: argv["cache"],
										cache_threshold: argv["cache-threshold"],
										cache_ttl: argv["cache-ttl"],
										chunk: argv["chunk"],
										chunk_overlap: argv["chunk-overlap"],
										chunk_size: argv["chunk-size"],
										custom_metadata: parseObjectArray(
											argv["custom-metadata"],
											"custom-metadata"
										),
										embedding_model: resolveFileToken(
											argv["embedding-model"] as string | undefined,
											"embedding-model",
											"text"
										),
										fusion_method: argv["fusion-method"],
										hybrid_search_enabled: argv["hybrid-search-enabled"],
										index_method: {
											keyword: argv["index-method-keyword"],
											vector: argv["index-method-vector"],
										},
										indexing_options: {
											file_summary: argv["indexing-options-file-summary"],
											keyword_tokenizer:
												argv["indexing-options-keyword-tokenizer"],
											use_ocr: argv["indexing-options-use-ocr"],
										},
										max_num_results: argv["max-num-results"],
										metadata: {
											created_from_aisearch_wizard:
												argv["metadata-created-from-aisearch-wizard"],
											created_from_emdash_plugin: {
												type: argv["metadata-created-from-emdash-plugin-type"],
												version: resolveFileToken(
													argv[
														"metadata-created-from-emdash-plugin-version"
													] as string | undefined,
													"metadata-created-from-emdash-plugin-version",
													"text"
												),
											},
											worker_domain: resolveFileToken(
												argv["metadata-worker-domain"] as string | undefined,
												"metadata-worker-domain",
												"text"
											),
										},
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
													argv[
														"public-endpoint-params-search-endpoint-disabled"
													],
											},
										},
										reranking: argv["reranking"],
										reranking_model: resolveFileToken(
											argv["reranking-model"] as string | undefined,
											"reranking-model",
											"text"
										),
										retrieval_options: {
											boost_by: parseObjectArray(
												argv["retrieval-options-boost-by"],
												"retrieval-options-boost-by"
											),
											keyword_match_mode:
												argv["retrieval-options-keyword-match-mode"],
										},
										rewrite_model: resolveFileToken(
											argv["rewrite-model"] as string | undefined,
											"rewrite-model",
											"text"
										),
										rewrite_query: argv["rewrite-query"],
										score_threshold: argv["score-threshold"],
										source: resolveFileToken(
											argv["source"] as string | undefined,
											"source",
											"text"
										),
										source_params: {
											d1: {
												query: resolveFileToken(
													argv["source-params-d1-query"] as string | undefined,
													"source-params-d1-query",
													"text"
												),
												template: argv["source-params-d1-template"],
											},
											exclude_items: argv["source-params-exclude-items"],
											include_items: argv["source-params-include-items"],
											prefix: resolveFileToken(
												argv["source-params-prefix"] as string | undefined,
												"source-params-prefix",
												"text"
											),
											r2_jurisdiction: resolveFileToken(
												argv["source-params-r2-jurisdiction"] as
													| string
													| undefined,
												"source-params-r2-jurisdiction",
												"text"
											),
											web_crawler: {
												discover_options: {
													depth:
														argv[
															"source-params-web-crawler-discover-options-depth"
														],
													include_external_links:
														argv[
															"source-params-web-crawler-discover-options-include-external-links"
														],
													include_subdomains:
														argv[
															"source-params-web-crawler-discover-options-include-subdomains"
														],
													limit:
														argv[
															"source-params-web-crawler-discover-options-limit"
														],
													max_age:
														argv[
															"source-params-web-crawler-discover-options-max-age"
														],
													source:
														argv[
															"source-params-web-crawler-discover-options-source"
														],
												},
												parse_options: {
													content_selector: parseObjectArray(
														argv[
															"source-params-web-crawler-parse-options-content-selector"
														],
														"source-params-web-crawler-parse-options-content-selector"
													),
													include_headers: parseJsonMap(
														argv[
															"source-params-web-crawler-parse-options-include-headers"
														],
														"source-params-web-crawler-parse-options-include-headers"
													),
													include_images:
														argv[
															"source-params-web-crawler-parse-options-include-images"
														],
													specific_sitemaps:
														argv[
															"source-params-web-crawler-parse-options-specific-sitemaps"
														],
													use_browser_rendering:
														argv[
															"source-params-web-crawler-parse-options-use-browser-rendering"
														],
												},
												parse_type:
													argv["source-params-web-crawler-parse-type"],
											},
										},
										sync_interval: argv["sync-interval"],
										token_id: resolveFileToken(
											argv["token-id"] as string | undefined,
											"token-id",
											"text"
										),
										type: argv["type"],
										id: argv["id"],
									},
									[
										[
											"source_params",
											"web_crawler",
											"parse_options",
											"include_headers",
										],
									]
								),
				});
				return;
			}
			const parsedBody =
				argv.body !== undefined
					? mergeBodyPositionals(parseBody(argv.body), [
							{ name: "id", field: "id", value: argv["id"] },
						])
					: undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						namespace: argv["namespace"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody(
				{
					ai_gateway_id: resolveFileToken(
						argv["ai-gateway-id"] as string | undefined,
						"ai-gateway-id",
						"text"
					),
					ai_search_model: resolveFileToken(
						argv["ai-search-model"] as string | undefined,
						"ai-search-model",
						"text"
					),
					cache: argv["cache"],
					cache_threshold: argv["cache-threshold"],
					cache_ttl: argv["cache-ttl"],
					chunk: argv["chunk"],
					chunk_overlap: argv["chunk-overlap"],
					chunk_size: argv["chunk-size"],
					custom_metadata: parseObjectArray(
						argv["custom-metadata"],
						"custom-metadata"
					),
					embedding_model: resolveFileToken(
						argv["embedding-model"] as string | undefined,
						"embedding-model",
						"text"
					),
					fusion_method: argv["fusion-method"],
					hybrid_search_enabled: argv["hybrid-search-enabled"],
					index_method: {
						keyword: argv["index-method-keyword"],
						vector: argv["index-method-vector"],
					},
					indexing_options: {
						file_summary: argv["indexing-options-file-summary"],
						keyword_tokenizer: argv["indexing-options-keyword-tokenizer"],
						use_ocr: argv["indexing-options-use-ocr"],
					},
					max_num_results: argv["max-num-results"],
					metadata: {
						created_from_aisearch_wizard:
							argv["metadata-created-from-aisearch-wizard"],
						created_from_emdash_plugin: {
							type: argv["metadata-created-from-emdash-plugin-type"],
							version: resolveFileToken(
								argv["metadata-created-from-emdash-plugin-version"] as
									| string
									| undefined,
								"metadata-created-from-emdash-plugin-version",
								"text"
							),
						},
						worker_domain: resolveFileToken(
							argv["metadata-worker-domain"] as string | undefined,
							"metadata-worker-domain",
							"text"
						),
					},
					public_endpoint_params: {
						authorized_hosts: argv["public-endpoint-params-authorized-hosts"],
						chat_completions_endpoint: {
							disabled:
								argv[
									"public-endpoint-params-chat-completions-endpoint-disabled"
								],
						},
						custom_domains: argv["public-endpoint-params-custom-domains"],
						default_domain_enabled:
							argv["public-endpoint-params-default-domain-enabled"],
						enabled: argv["public-endpoint-params-enabled"],
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
					reranking: argv["reranking"],
					reranking_model: resolveFileToken(
						argv["reranking-model"] as string | undefined,
						"reranking-model",
						"text"
					),
					retrieval_options: {
						boost_by: parseObjectArray(
							argv["retrieval-options-boost-by"],
							"retrieval-options-boost-by"
						),
						keyword_match_mode: argv["retrieval-options-keyword-match-mode"],
					},
					rewrite_model: resolveFileToken(
						argv["rewrite-model"] as string | undefined,
						"rewrite-model",
						"text"
					),
					rewrite_query: argv["rewrite-query"],
					score_threshold: argv["score-threshold"],
					source: resolveFileToken(
						argv["source"] as string | undefined,
						"source",
						"text"
					),
					source_params: {
						d1: {
							query: resolveFileToken(
								argv["source-params-d1-query"] as string | undefined,
								"source-params-d1-query",
								"text"
							),
							template: argv["source-params-d1-template"],
						},
						exclude_items: argv["source-params-exclude-items"],
						include_items: argv["source-params-include-items"],
						prefix: resolveFileToken(
							argv["source-params-prefix"] as string | undefined,
							"source-params-prefix",
							"text"
						),
						r2_jurisdiction: resolveFileToken(
							argv["source-params-r2-jurisdiction"] as string | undefined,
							"source-params-r2-jurisdiction",
							"text"
						),
						web_crawler: {
							discover_options: {
								depth: argv["source-params-web-crawler-discover-options-depth"],
								include_external_links:
									argv[
										"source-params-web-crawler-discover-options-include-external-links"
									],
								include_subdomains:
									argv[
										"source-params-web-crawler-discover-options-include-subdomains"
									],
								limit: argv["source-params-web-crawler-discover-options-limit"],
								max_age:
									argv["source-params-web-crawler-discover-options-max-age"],
								source:
									argv["source-params-web-crawler-discover-options-source"],
							},
							parse_options: {
								content_selector: parseObjectArray(
									argv[
										"source-params-web-crawler-parse-options-content-selector"
									],
									"source-params-web-crawler-parse-options-content-selector"
								),
								include_headers: parseJsonMap(
									argv[
										"source-params-web-crawler-parse-options-include-headers"
									],
									"source-params-web-crawler-parse-options-include-headers"
								),
								include_images:
									argv[
										"source-params-web-crawler-parse-options-include-images"
									],
								specific_sitemaps:
									argv[
										"source-params-web-crawler-parse-options-specific-sitemaps"
									],
								use_browser_rendering:
									argv[
										"source-params-web-crawler-parse-options-use-browser-rendering"
									],
							},
							parse_type: argv["source-params-web-crawler-parse-type"],
						},
					},
					sync_interval: argv["sync-interval"],
					token_id: resolveFileToken(
						argv["token-id"] as string | undefined,
						"token-id",
						"text"
					),
					type: argv["type"],
					id: argv["id"],
				},
				[["source_params", "web_crawler", "parse_options", "include_headers"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					namespace: argv["namespace"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
