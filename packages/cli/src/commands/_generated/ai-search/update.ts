import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/ai-search.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-search update <instance-id>\n\nUpdates the configuration of an AI Search instance."
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
		.coerce("cache-threshold", (value) =>
			resolveFileToken(value, "cache-threshold", "text")
		)
		.option("cache-ttl", {
			type: "number",
			description:
				"Cache entry TTL in seconds. Allowed values: 600 (10min), 1800 (30min), 3600 (1h), 7200 (2h), 21600 (6h), 43200 (12h), 86400 (24h), 172800 (48h), 259200 (72h), 518400 (6d).",
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
		.coerce("fusion-method", (value) =>
			resolveFileToken(value, "fusion-method", "text")
		)
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
		.coerce("indexing-options-keyword-tokenizer", (value) =>
			resolveFileToken(value, "indexing-options-keyword-tokenizer", "text")
		)
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
		.coerce("metadata-created-from-emdash-plugin-type", (value) =>
			resolveFileToken(
				value,
				"metadata-created-from-emdash-plugin-type",
				"text"
			)
		)
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
			description:
				"Disable chat completions endpoint for this public endpoint.",
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
			description: "Disable MCP endpoint for this public endpoint.",
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
		.coerce("public-endpoint-params-rate-limit-technique", (value) =>
			resolveFileToken(
				value,
				"public-endpoint-params-rate-limit-technique",
				"text"
			)
		)
		.option("public-endpoint-params-search-endpoint-disabled", {
			type: "boolean",
			description: "Disable search endpoint for this public endpoint.",
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
				"Controls which documents become candidates for BM25 scoring. 'and' restricts candidates to documents containing all query terms; 'or' includes any document containing at least one term and ranks results according to BM25 relevance. When omitted on an update, the existing stored value stays unchanged; when never set, search falls back to 'and'.",
			choices: ["and", "or"],
		})
		.coerce("retrieval-options-keyword-match-mode", (value) =>
			resolveFileToken(value, "retrieval-options-keyword-match-mode", "text")
		)
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
			description:
				"Minimum similarity score a chunk must reach to be returned. Defaults to 0.4.",
		})
		.option("source", {
			type: "string",
			description: "R2 bucket name or HTTP(S) root website URL to index.",
		})
		.option("source-params-exclude-items", {
			type: "string",
			array: true,
			description:
				"List of path patterns to exclude. Uses micromatch glob syntax: * matches within a path segment, ** matches across path segments (e.g., /admin/** matches /admin/users and /admin/settings/advanced). Most accounts have a limit of 10 rules; contact support to raise it.",
		})
		.option("source-params-include-items", {
			type: "string",
			array: true,
			description:
				"List of path patterns to include. Uses micromatch glob syntax: * matches within a path segment, ** matches across path segments (e.g., /blog/** matches /blog/post and /blog/2024/post). Most accounts have a limit of 10 rules; contact support to raise it.",
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
					"Follow links that point outside the source domain. Must stay `false` because discover crawls only cover the zone you own.",
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
		.coerce("source-params-web-crawler-discover-options-source", (value) =>
			resolveFileToken(
				value,
				"source-params-web-crawler-discover-options-source",
				"text"
			)
		)
		.option("source-params-web-crawler-parse-options-include-headers", {
			type: "string",
			description:
				"Up to 5 custom HTTP headers sent with each crawl request. Names must use RFC-7230 token characters, excluding spaces, colons, and control characters. Values must use HTAB and printable ASCII only, excluding CR and LF. Provide as a JSON object or @path/to/file.json.",
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
				"How the crawler finds URLs. 'sitemap' reads XML sitemaps; 'discover' follows links recursively and requires the source to belong to a Verified zone on this account.",
			choices: ["sitemap", "discover"],
		})
		.coerce("source-params-web-crawler-parse-type", (value) =>
			resolveFileToken(value, "source-params-web-crawler-parse-type", "text")
		)
		.option("summarization", {
			type: "boolean",
			description: "The summarization field",
		})
		.option("summarization-model", {
			type: "string",
			description: "The summarization_model field",
		})
		.option("sync-interval", {
			type: "number",
			description:
				"Interval between automatic syncs, in seconds. Allowed values: 900 (15min), 1800 (30min), 3600 (1h), 7200 (2h), 14400 (4h), 21600 (6h), 43200 (12h), 86400 (24h). Defaults to 21600 (6h); instances crawling a domain outside the account may be set to 86400.",
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
							namespace: String(argv["namespace"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
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
											index_method: {
												keyword: argv["index-method-keyword"],
												vector: argv["index-method-vector"],
											},
											indexing_options: {
												keyword_tokenizer:
													argv["indexing-options-keyword-tokenizer"],
												use_ocr: argv["indexing-options-use-ocr"],
											},
											max_num_results: argv["max-num-results"],
											metadata: {
												created_from_aisearch_wizard:
													argv["metadata-created-from-aisearch-wizard"],
												created_from_emdash_plugin: {
													type: argv[
														"metadata-created-from-emdash-plugin-type"
													],
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
											summarization: argv["summarization"],
											summarization_model: resolveFileToken(
												argv["summarization-model"] as string | undefined,
												"summarization-model",
												"text"
											),
											sync_interval: argv["sync-interval"],
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
												argv["system-prompt-rewrite-query"] as
													| string
													| undefined,
												"system-prompt-rewrite-query",
												"text"
											),
											token_id: resolveFileToken(
												argv["token-id"] as string | undefined,
												"token-id",
												"text"
											),
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["ai-gateway-id"] !== undefined)
					setNestedValue(
						bodyData,
						["ai_gateway_id"],
						resolveFileToken(
							argv["ai-gateway-id"] as string | undefined,
							"ai-gateway-id",
							"text"
						)
					);
				if (argv["ai-search-model"] !== undefined)
					setNestedValue(
						bodyData,
						["ai_search_model"],
						resolveFileToken(
							argv["ai-search-model"] as string | undefined,
							"ai-search-model",
							"text"
						)
					);
				if (argv["cache"] !== undefined)
					setNestedValue(bodyData, ["cache"], argv["cache"]);
				if (argv["cache-threshold"] !== undefined)
					setNestedValue(
						bodyData,
						["cache_threshold"],
						argv["cache-threshold"]
					);
				if (argv["cache-ttl"] !== undefined)
					setNestedValue(bodyData, ["cache_ttl"], argv["cache-ttl"]);
				if (argv["chunk"] !== undefined)
					setNestedValue(bodyData, ["chunk"], argv["chunk"]);
				if (argv["chunk-overlap"] !== undefined)
					setNestedValue(bodyData, ["chunk_overlap"], argv["chunk-overlap"]);
				if (argv["chunk-size"] !== undefined)
					setNestedValue(bodyData, ["chunk_size"], argv["chunk-size"]);
				if (argv["custom-metadata"] !== undefined)
					setNestedValue(
						bodyData,
						["custom_metadata"],
						parseObjectArray(argv["custom-metadata"], "custom-metadata")
					);
				if (argv["embedding-model"] !== undefined)
					setNestedValue(
						bodyData,
						["embedding_model"],
						resolveFileToken(
							argv["embedding-model"] as string | undefined,
							"embedding-model",
							"text"
						)
					);
				if (argv["fusion-method"] !== undefined)
					setNestedValue(bodyData, ["fusion_method"], argv["fusion-method"]);
				if (argv["index-method-keyword"] !== undefined)
					setNestedValue(
						bodyData,
						["index_method", "keyword"],
						argv["index-method-keyword"]
					);
				if (argv["index-method-vector"] !== undefined)
					setNestedValue(
						bodyData,
						["index_method", "vector"],
						argv["index-method-vector"]
					);
				if (argv["indexing-options-keyword-tokenizer"] !== undefined)
					setNestedValue(
						bodyData,
						["indexing_options", "keyword_tokenizer"],
						argv["indexing-options-keyword-tokenizer"]
					);
				if (argv["indexing-options-use-ocr"] !== undefined)
					setNestedValue(
						bodyData,
						["indexing_options", "use_ocr"],
						argv["indexing-options-use-ocr"]
					);
				if (argv["max-num-results"] !== undefined)
					setNestedValue(
						bodyData,
						["max_num_results"],
						argv["max-num-results"]
					);
				if (argv["metadata-created-from-aisearch-wizard"] !== undefined)
					setNestedValue(
						bodyData,
						["metadata", "created_from_aisearch_wizard"],
						argv["metadata-created-from-aisearch-wizard"]
					);
				if (argv["metadata-created-from-emdash-plugin-type"] !== undefined)
					setNestedValue(
						bodyData,
						["metadata", "created_from_emdash_plugin", "type"],
						argv["metadata-created-from-emdash-plugin-type"]
					);
				if (argv["metadata-created-from-emdash-plugin-version"] !== undefined)
					setNestedValue(
						bodyData,
						["metadata", "created_from_emdash_plugin", "version"],
						resolveFileToken(
							argv["metadata-created-from-emdash-plugin-version"] as
								| string
								| undefined,
							"metadata-created-from-emdash-plugin-version",
							"text"
						)
					);
				if (argv["metadata-worker-domain"] !== undefined)
					setNestedValue(
						bodyData,
						["metadata", "worker_domain"],
						resolveFileToken(
							argv["metadata-worker-domain"] as string | undefined,
							"metadata-worker-domain",
							"text"
						)
					);
				if (argv["paused"] !== undefined)
					setNestedValue(bodyData, ["paused"], argv["paused"]);
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
				if (
					argv["public-endpoint-params-search-endpoint-disabled"] !== undefined
				)
					setNestedValue(
						bodyData,
						["public_endpoint_params", "search_endpoint", "disabled"],
						argv["public-endpoint-params-search-endpoint-disabled"]
					);
				if (argv["reranking"] !== undefined)
					setNestedValue(bodyData, ["reranking"], argv["reranking"]);
				if (argv["reranking-model"] !== undefined)
					setNestedValue(
						bodyData,
						["reranking_model"],
						resolveFileToken(
							argv["reranking-model"] as string | undefined,
							"reranking-model",
							"text"
						)
					);
				if (argv["retrieval-options-keyword-match-mode"] !== undefined)
					setNestedValue(
						bodyData,
						["retrieval_options", "keyword_match_mode"],
						argv["retrieval-options-keyword-match-mode"]
					);
				if (argv["rewrite-model"] !== undefined)
					setNestedValue(
						bodyData,
						["rewrite_model"],
						resolveFileToken(
							argv["rewrite-model"] as string | undefined,
							"rewrite-model",
							"text"
						)
					);
				if (argv["rewrite-query"] !== undefined)
					setNestedValue(bodyData, ["rewrite_query"], argv["rewrite-query"]);
				if (argv["score-threshold"] !== undefined)
					setNestedValue(
						bodyData,
						["score_threshold"],
						argv["score-threshold"]
					);
				if (argv["source"] !== undefined)
					setNestedValue(
						bodyData,
						["source"],
						resolveFileToken(
							argv["source"] as string | undefined,
							"source",
							"text"
						)
					);
				if (argv["source-params-exclude-items"] !== undefined)
					setNestedValue(
						bodyData,
						["source_params", "exclude_items"],
						argv["source-params-exclude-items"]
					);
				if (argv["source-params-include-items"] !== undefined)
					setNestedValue(
						bodyData,
						["source_params", "include_items"],
						argv["source-params-include-items"]
					);
				if (argv["source-params-prefix"] !== undefined)
					setNestedValue(
						bodyData,
						["source_params", "prefix"],
						resolveFileToken(
							argv["source-params-prefix"] as string | undefined,
							"source-params-prefix",
							"text"
						)
					);
				if (argv["source-params-r2-jurisdiction"] !== undefined)
					setNestedValue(
						bodyData,
						["source_params", "r2_jurisdiction"],
						resolveFileToken(
							argv["source-params-r2-jurisdiction"] as string | undefined,
							"source-params-r2-jurisdiction",
							"text"
						)
					);
				if (
					argv["source-params-web-crawler-discover-options-depth"] !== undefined
				)
					setNestedValue(
						bodyData,
						["source_params", "web_crawler", "discover_options", "depth"],
						argv["source-params-web-crawler-discover-options-depth"]
					);
				if (
					argv[
						"source-params-web-crawler-discover-options-include-external-links"
					] !== undefined
				)
					setNestedValue(
						bodyData,
						[
							"source_params",
							"web_crawler",
							"discover_options",
							"include_external_links",
						],
						argv[
							"source-params-web-crawler-discover-options-include-external-links"
						]
					);
				if (
					argv[
						"source-params-web-crawler-discover-options-include-subdomains"
					] !== undefined
				)
					setNestedValue(
						bodyData,
						[
							"source_params",
							"web_crawler",
							"discover_options",
							"include_subdomains",
						],
						argv[
							"source-params-web-crawler-discover-options-include-subdomains"
						]
					);
				if (
					argv["source-params-web-crawler-discover-options-limit"] !== undefined
				)
					setNestedValue(
						bodyData,
						["source_params", "web_crawler", "discover_options", "limit"],
						argv["source-params-web-crawler-discover-options-limit"]
					);
				if (
					argv["source-params-web-crawler-discover-options-max-age"] !==
					undefined
				)
					setNestedValue(
						bodyData,
						["source_params", "web_crawler", "discover_options", "max_age"],
						argv["source-params-web-crawler-discover-options-max-age"]
					);
				if (
					argv["source-params-web-crawler-discover-options-source"] !==
					undefined
				)
					setNestedValue(
						bodyData,
						["source_params", "web_crawler", "discover_options", "source"],
						argv["source-params-web-crawler-discover-options-source"]
					);
				if (
					argv["source-params-web-crawler-parse-options-include-headers"] !==
					undefined
				)
					setNestedValue(
						bodyData,
						[
							"source_params",
							"web_crawler",
							"parse_options",
							"include_headers",
						],
						parseJsonMap(
							argv["source-params-web-crawler-parse-options-include-headers"],
							"source-params-web-crawler-parse-options-include-headers"
						)
					);
				if (
					argv["source-params-web-crawler-parse-options-include-images"] !==
					undefined
				)
					setNestedValue(
						bodyData,
						["source_params", "web_crawler", "parse_options", "include_images"],
						argv["source-params-web-crawler-parse-options-include-images"]
					);
				if (
					argv["source-params-web-crawler-parse-options-specific-sitemaps"] !==
					undefined
				)
					setNestedValue(
						bodyData,
						[
							"source_params",
							"web_crawler",
							"parse_options",
							"specific_sitemaps",
						],
						argv["source-params-web-crawler-parse-options-specific-sitemaps"]
					);
				if (
					argv[
						"source-params-web-crawler-parse-options-use-browser-rendering"
					] !== undefined
				)
					setNestedValue(
						bodyData,
						[
							"source_params",
							"web_crawler",
							"parse_options",
							"use_browser_rendering",
						],
						argv[
							"source-params-web-crawler-parse-options-use-browser-rendering"
						]
					);
				if (argv["source-params-web-crawler-parse-type"] !== undefined)
					setNestedValue(
						bodyData,
						["source_params", "web_crawler", "parse_type"],
						argv["source-params-web-crawler-parse-type"]
					);
				if (argv["summarization"] !== undefined)
					setNestedValue(bodyData, ["summarization"], argv["summarization"]);
				if (argv["summarization-model"] !== undefined)
					setNestedValue(
						bodyData,
						["summarization_model"],
						resolveFileToken(
							argv["summarization-model"] as string | undefined,
							"summarization-model",
							"text"
						)
					);
				if (argv["sync-interval"] !== undefined)
					setNestedValue(bodyData, ["sync_interval"], argv["sync-interval"]);
				if (argv["system-prompt-ai-search"] !== undefined)
					setNestedValue(
						bodyData,
						["system_prompt_ai_search"],
						resolveFileToken(
							argv["system-prompt-ai-search"] as string | undefined,
							"system-prompt-ai-search",
							"text"
						)
					);
				if (argv["system-prompt-index-summarization"] !== undefined)
					setNestedValue(
						bodyData,
						["system_prompt_index_summarization"],
						resolveFileToken(
							argv["system-prompt-index-summarization"] as string | undefined,
							"system-prompt-index-summarization",
							"text"
						)
					);
				if (argv["system-prompt-rewrite-query"] !== undefined)
					setNestedValue(
						bodyData,
						["system_prompt_rewrite_query"],
						resolveFileToken(
							argv["system-prompt-rewrite-query"] as string | undefined,
							"system-prompt-rewrite-query",
							"text"
						)
					);
				if (argv["token-id"] !== undefined)
					setNestedValue(
						bodyData,
						["token_id"],
						resolveFileToken(
							argv["token-id"] as string | undefined,
							"token-id",
							"text"
						)
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
