import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/ai-search.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-search update <instance-id>\n\nUpdate the configuration of an AI Search instance."
		)
		.positional("instance-id", {
			type: "string",
			description: "AI Search instance ID.",
			demandOption: true,
		})
		.option("namespace", {
			type: "string",
			description: "Namespace to use for this operation.",
			demandOption: true,
		})
		.option("ai-gateway-id", {
			type: "string",
			description: "The ai_gateway_id field",
		})
		.option("ai-search-model", {
			type: "string",
			description:
				"A Workers AI model ID or an AI Gateway model ID compatible with the OpenAI Chat Completions API. An empty string uses the configured or default model.",
		})
		.option("cache", { type: "boolean", description: "The cache field" })
		.option("cache-threshold", {
			type: "string",
			description: "The cache_threshold field",
			choices: [
				"super_strict_match",
				"close_enough",
				"flexible_friend",
				"anything_goes",
			],
		})
		.option("chunk", { type: "boolean", description: "The chunk field" })
		.option("chunk-overlap", {
			type: "number",
			description: "The chunk_overlap field",
		})
		.option("chunk-size", {
			type: "number",
			description: "The chunk_size field",
		})
		.option("custom-metadata", {
			type: "string",
			description:
				"The custom_metadata field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("embedding-model", {
			type: "string",
			description: "The embedding_model field",
		})
		.option("fusion-method", {
			type: "string",
			description: "The fusion_method field",
			choices: ["max", "rrf"],
		})
		.option("index-method-keyword", {
			type: "boolean",
			description: "Enable keyword (BM25) storage backend.",
		})
		.option("index-method-vector", {
			type: "boolean",
			description: "Enable vector (embedding) storage backend.",
		})
		.option("indexing-options-keyword-tokenizer", {
			type: "string",
			description:
				"Tokenizer used for keyword search indexing. porter provides word-level tokenization with Porter stemming (good for natural language queries). trigram enables character-level substring matching (good for partial matches, code, identifiers). Changing this triggers a full re-index. Defaults to porter.",
			choices: ["porter", "trigram"],
		})
		.option("indexing-options-use-ocr", {
			type: "boolean",
			description:
				"Enables OCR ingestion for PDFs and images. Changing this triggers a full re-index. Defaults to false.",
		})
		.option("max-num-results", {
			type: "number",
			description: "The max_num_results field",
		})
		.option("metadata-created-from-aisearch-wizard", {
			type: "boolean",
			description: "The metadata.created_from_aisearch_wizard field",
		})
		.option("metadata-created-from-emdash-plugin-type", {
			type: "string",
			description: "The metadata.created_from_emdash_plugin.type field",
			choices: ["native", "rest"],
		})
		.option("metadata-created-from-emdash-plugin-version", {
			type: "string",
			description: "The metadata.created_from_emdash_plugin.version field",
		})
		.option("metadata-worker-domain", {
			type: "string",
			description: "The metadata.worker_domain field",
		})
		.option("paused", { type: "boolean", description: "The paused field" })
		.option("public-endpoint-params-authorized-hosts", {
			type: "string",
			array: true,
			description: "The public_endpoint_params.authorized_hosts field",
		})
		.option("public-endpoint-params-chat-completions-endpoint-disabled", {
			type: "boolean",
			description: "Disable chat completions endpoint for this public endpoint",
		})
		.option("public-endpoint-params-custom-domains", {
			type: "string",
			array: true,
			description:
				"Custom domain hostnames that alias this public endpoint. GET and create responses return the current set; on update (PUT) this field is only echoed back when supplied in the request body, otherwise it is null (omit it to leave domains unchanged).",
		})
		.option("public-endpoint-params-default-domain-enabled", {
			type: "boolean",
			description:
				"When false, the instance is reachable only via a registered custom domain and the default <public_endpoint_id>.search.ai.cloudflare.com host returns 404. Requires at least one custom domain. Defaults to true. public_endpoint_params is replaced wholesale on update, so resend default_domain_enabled on every update to keep the default host off — omitting it resets to true.",
		})
		.option("public-endpoint-params-enabled", {
			type: "boolean",
			description: "The public_endpoint_params.enabled field",
		})
		.option("public-endpoint-params-mcp-description", {
			type: "string",
			description: "The public_endpoint_params.mcp.description field",
		})
		.option("public-endpoint-params-mcp-disabled", {
			type: "boolean",
			description: "Disable MCP endpoint for this public endpoint",
		})
		.option("public-endpoint-params-rate-limit-period-ms", {
			type: "number",
			description: "The public_endpoint_params.rate_limit.period_ms field",
		})
		.option("public-endpoint-params-rate-limit-requests", {
			type: "number",
			description: "The public_endpoint_params.rate_limit.requests field",
		})
		.option("public-endpoint-params-rate-limit-technique", {
			type: "string",
			description: "The public_endpoint_params.rate_limit.technique field",
			choices: ["fixed", "sliding"],
		})
		.option("public-endpoint-params-search-endpoint-disabled", {
			type: "boolean",
			description: "Disable search endpoint for this public endpoint",
		})
		.option("reranking", {
			type: "boolean",
			description: "The reranking field",
		})
		.option("reranking-model", {
			type: "string",
			description: "The reranking_model field",
		})
		.option("retrieval-options-keyword-match-mode", {
			type: "string",
			description:
				"Controls which documents are candidates for BM25 scoring. 'and' restricts candidates to documents containing all query terms; 'or' includes any document containing at least one term, ranked by BM25 relevance. When omitted on an update, the existing stored value is preserved; when never set, search falls back to 'and'.",
			choices: ["and", "or"],
		})
		.option("rewrite-model", {
			type: "string",
			description:
				"A Workers AI model ID or an AI Gateway model ID compatible with the OpenAI Chat Completions API. An empty string uses the configured or default model.",
		})
		.option("rewrite-query", {
			type: "boolean",
			description: "The rewrite_query field",
		})
		.option("score-threshold", {
			type: "number",
			description: "The score_threshold field",
		})
		.option("source", { type: "string", description: "The source field" })
		.option("source-params-exclude-items", {
			type: "string",
			array: true,
			description:
				"List of path patterns to exclude. Uses micromatch glob syntax: * matches within a path segment, ** matches across path segments (e.g., /admin/** matches /admin/users and /admin/settings/advanced). Most accounts are limited to 10 rules; contact support to raise it.",
		})
		.option("source-params-include-items", {
			type: "string",
			array: true,
			description:
				"List of path patterns to include. Uses micromatch glob syntax: * matches within a path segment, ** matches across path segments (e.g., /blog/** matches /blog/post and /blog/2024/post). Most accounts are limited to 10 rules; contact support to raise it.",
		})
		.option("source-params-prefix", {
			type: "string",
			description: "The source_params.prefix field",
		})
		.option("source-params-r2-jurisdiction", {
			type: "string",
			description: "The source_params.r2_jurisdiction field",
		})
		.option("source-params-web-crawler-discover-options-depth", {
			type: "number",
			description: "Maximum link-follow depth from the seed URL.",
		})
		.option(
			"source-params-web-crawler-discover-options-include-external-links",
			{
				type: "boolean",
				description:
					"Follow links that point outside the source domain. Must stay `false` — discover crawls are restricted to the zone you own.",
			}
		)
		.option("source-params-web-crawler-discover-options-include-subdomains", {
			type: "boolean",
			description: "Follow links to subdomains of the source host.",
		})
		.option("source-params-web-crawler-discover-options-limit", {
			type: "number",
			description: "Maximum number of pages to crawl (1-100000).",
		})
		.option("source-params-web-crawler-discover-options-max-age", {
			type: "number",
			description: "Maximum content age in seconds to accept (0–604800).",
		})
		.option("source-params-web-crawler-discover-options-source", {
			type: "string",
			description:
				"Where the crawler looks for URLs: 'sitemaps' reads sitemap XML only, 'links' follows page links only, 'all' does both.",
			choices: ["all", "sitemaps", "links"],
		})
		.option("source-params-web-crawler-parse-options-include-images", {
			type: "boolean",
			description:
				"The source_params.web_crawler.parse_options.include_images field",
		})
		.option("source-params-web-crawler-parse-options-specific-sitemaps", {
			type: "string",
			array: true,
			description:
				"List of specific sitemap URLs to use for crawling. Only valid when parse_type is 'sitemap'.",
		})
		.option("source-params-web-crawler-parse-options-use-browser-rendering", {
			type: "boolean",
			description:
				"The source_params.web_crawler.parse_options.use_browser_rendering field",
		})
		.option("source-params-web-crawler-parse-type", {
			type: "string",
			description:
				"How URLs are discovered. 'sitemap' reads XML sitemaps; 'discover' follows links recursively and requires the source to be a Verified zone on this account.",
			choices: ["sitemap", "discover"],
		})
		.option("summarization", {
			type: "boolean",
			description: "The summarization field",
		})
		.option("summarization-model", {
			type: "string",
			description: "The summarization_model field",
		})
		.option("system-prompt-ai-search", {
			type: "string",
			description: "The system_prompt_ai_search field",
		})
		.option("system-prompt-index-summarization", {
			type: "string",
			description: "The system_prompt_index_summarization field",
		})
		.option("system-prompt-rewrite-query", {
			type: "string",
			description: "The system_prompt_rewrite_query field",
		})
		.option("token-id", { type: "string", description: "The token_id field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = ["index-method-keyword", "index-method-vector"].some(
				(k) => argv[k] !== undefined
			);
			if (groupSet) {
				const missing = ["index-method-keyword", "index-method-vector"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --index_method-* flag is set`
					);
				}
			}
			return true;
		})
		.check((argv) => {
			const groupSet = [
				"metadata-created-from-aisearch-wizard",
				"metadata-created-from-emdash-plugin-type",
				"metadata-created-from-emdash-plugin-version",
				"metadata-worker-domain",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"metadata-created-from-emdash-plugin-type",
					"metadata-created-from-emdash-plugin-version",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --metadata-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"ai-search-namespace-update-instance">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <instance-id>",
	describe: "Update an AI Search instance.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search update",
				classification: {
					safeFlags: [
						"cache",
						"cache-threshold",
						"chunk",
						"fusion-method",
						"index-method-keyword",
						"index-method-vector",
						"indexing-options-keyword-tokenizer",
						"indexing-options-use-ocr",
						"metadata-created-from-aisearch-wizard",
						"metadata-created-from-emdash-plugin-type",
						"paused",
						"public-endpoint-params-chat-completions-endpoint-disabled",
						"public-endpoint-params-default-domain-enabled",
						"public-endpoint-params-enabled",
						"public-endpoint-params-mcp-disabled",
						"public-endpoint-params-rate-limit-technique",
						"public-endpoint-params-search-endpoint-disabled",
						"reranking",
						"retrieval-options-keyword-match-mode",
						"rewrite-query",
						"source-params-web-crawler-discover-options-include-external-links",
						"source-params-web-crawler-discover-options-include-subdomains",
						"source-params-web-crawler-discover-options-source",
						"source-params-web-crawler-parse-options-include-images",
						"source-params-web-crawler-parse-options-use-browser-rendering",
						"source-params-web-crawler-parse-type",
						"summarization",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}`,
						pathParams: {
							"instance-id": String(argv["instance-id"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
										cache_threshold: resolveFileToken(
											argv["cache-threshold"] as string | undefined,
											"cache-threshold",
											"text"
										),
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
										fusion_method: resolveFileToken(
											argv["fusion-method"] as string | undefined,
											"fusion-method",
											"text"
										),
										index_method: {
											keyword: argv["index-method-keyword"],
											vector: argv["index-method-vector"],
										},
										indexing_options: {
											keyword_tokenizer: resolveFileToken(
												argv["indexing-options-keyword-tokenizer"] as
													| string
													| undefined,
												"indexing-options-keyword-tokenizer",
												"text"
											),
											use_ocr: argv["indexing-options-use-ocr"],
										},
										max_num_results: argv["max-num-results"],
										metadata: {
											created_from_aisearch_wizard:
												argv["metadata-created-from-aisearch-wizard"],
											created_from_emdash_plugin: {
												type: resolveFileToken(
													argv["metadata-created-from-emdash-plugin-type"] as
														| string
														| undefined,
													"metadata-created-from-emdash-plugin-type",
													"text"
												),
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
										paused: argv["paused"],
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
												technique: resolveFileToken(
													argv[
														"public-endpoint-params-rate-limit-technique"
													] as string | undefined,
													"public-endpoint-params-rate-limit-technique",
													"text"
												),
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
											keyword_match_mode: resolveFileToken(
												argv["retrieval-options-keyword-match-mode"] as
													| string
													| undefined,
												"retrieval-options-keyword-match-mode",
												"text"
											),
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
													source: resolveFileToken(
														argv[
															"source-params-web-crawler-discover-options-source"
														] as string | undefined,
														"source-params-web-crawler-discover-options-source",
														"text"
													),
												},
												parse_options: {
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
												parse_type: resolveFileToken(
													argv["source-params-web-crawler-parse-type"] as
														| string
														| undefined,
													"source-params-web-crawler-parse-type",
													"text"
												),
											},
										},
										summarization: argv["summarization"],
										summarization_model: resolveFileToken(
											argv["summarization-model"] as string | undefined,
											"summarization-model",
											"text"
										),
										system_prompt_ai_search: resolveFileToken(
											argv["system-prompt-ai-search"] as string | undefined,
											"system-prompt-ai-search",
											"text"
										),
										system_prompt_index_summarization: resolveFileToken(
											argv["system-prompt-index-summarization"] as
												| string
												| undefined,
											"system-prompt-index-summarization",
											"text"
										),
										system_prompt_rewrite_query: resolveFileToken(
											argv["system-prompt-rewrite-query"] as string | undefined,
											"system-prompt-rewrite-query",
											"text"
										),
										token_id: resolveFileToken(
											argv["token-id"] as string | undefined,
											"token-id",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.aiSearch.update({
							...bodyData,
							account_id: accountId,
							namespace: argv["namespace"],
							"instance-id": argv["instance-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					cache_threshold: resolveFileToken(
						argv["cache-threshold"] as string | undefined,
						"cache-threshold",
						"text"
					),
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
					fusion_method: resolveFileToken(
						argv["fusion-method"] as string | undefined,
						"fusion-method",
						"text"
					),
					index_method: {
						keyword: argv["index-method-keyword"],
						vector: argv["index-method-vector"],
					},
					indexing_options: {
						keyword_tokenizer: resolveFileToken(
							argv["indexing-options-keyword-tokenizer"] as string | undefined,
							"indexing-options-keyword-tokenizer",
							"text"
						),
						use_ocr: argv["indexing-options-use-ocr"],
					},
					max_num_results: argv["max-num-results"],
					metadata: {
						created_from_aisearch_wizard:
							argv["metadata-created-from-aisearch-wizard"],
						created_from_emdash_plugin: {
							type: resolveFileToken(
								argv["metadata-created-from-emdash-plugin-type"] as
									| string
									| undefined,
								"metadata-created-from-emdash-plugin-type",
								"text"
							),
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
					paused: argv["paused"],
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
							technique: resolveFileToken(
								argv["public-endpoint-params-rate-limit-technique"] as
									| string
									| undefined,
								"public-endpoint-params-rate-limit-technique",
								"text"
							),
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
						keyword_match_mode: resolveFileToken(
							argv["retrieval-options-keyword-match-mode"] as
								| string
								| undefined,
							"retrieval-options-keyword-match-mode",
							"text"
						),
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
								source: resolveFileToken(
									argv["source-params-web-crawler-discover-options-source"] as
										| string
										| undefined,
									"source-params-web-crawler-discover-options-source",
									"text"
								),
							},
							parse_options: {
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
							parse_type: resolveFileToken(
								argv["source-params-web-crawler-parse-type"] as
									| string
									| undefined,
								"source-params-web-crawler-parse-type",
								"text"
							),
						},
					},
					summarization: argv["summarization"],
					summarization_model: resolveFileToken(
						argv["summarization-model"] as string | undefined,
						"summarization-model",
						"text"
					),
					system_prompt_ai_search: resolveFileToken(
						argv["system-prompt-ai-search"] as string | undefined,
						"system-prompt-ai-search",
						"text"
					),
					system_prompt_index_summarization: resolveFileToken(
						argv["system-prompt-index-summarization"] as string | undefined,
						"system-prompt-index-summarization",
						"text"
					),
					system_prompt_rewrite_query: resolveFileToken(
						argv["system-prompt-rewrite-query"] as string | undefined,
						"system-prompt-rewrite-query",
						"text"
					),
					token_id: resolveFileToken(
						argv["token-id"] as string | undefined,
						"token-id",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.aiSearch.update({
						...bodyData,
						account_id: accountId,
						namespace: argv["namespace"],
						"instance-id": argv["instance-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
