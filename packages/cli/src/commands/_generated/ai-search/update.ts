/**
 * update command
 * @generated from apis/overlays/ai-search.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
		"ai-gateway-id": {
			kind: "parsed",
			brief: "The ai_gateway_id field",
			optional: true,
			parse: String,
		},
		"ai-search-model": {
			kind: "parsed",
			brief:
				"A Workers AI model ID or an AI Gateway model ID compatible with the OpenAI Chat Completions API. An empty string uses the configured or default model.",
			optional: true,
			parse: String,
		},
		cache: { kind: "boolean", brief: "The cache field", optional: true },
		"cache-threshold": {
			kind: "parsed",
			brief: "The cache_threshold field",
			optional: true,
			choices: [
				"super_strict_match",
				"close_enough",
				"flexible_friend",
				"anything_goes",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "cache-threshold", "text"),
		},
		"cache-ttl": {
			kind: "parsed",
			brief:
				"Cache entry TTL in seconds. Allowed values: 600 (10min), 1800 (30min), 3600 (1h), 7200 (2h), 21600 (6h), 43200 (12h), 86400 (24h), 172800 (48h), 259200 (72h), 518400 (6d).",
			optional: true,
			parse: Number,
		},
		chunk: { kind: "boolean", brief: "The chunk field", optional: true },
		"chunk-overlap": {
			kind: "parsed",
			brief: "The chunk_overlap field",
			optional: true,
			parse: Number,
		},
		"chunk-size": {
			kind: "parsed",
			brief: "The chunk_size field",
			optional: true,
			parse: Number,
		},
		"custom-metadata": {
			kind: "parsed",
			brief:
				'The custom_metadata field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"data_type": "text" | "number" | "boolean" | ...more, "field_name": string}].',
			optional: true,
			parse: String,
		},
		"embedding-model": {
			kind: "parsed",
			brief: "The embedding_model field",
			optional: true,
			parse: String,
		},
		"fusion-method": {
			kind: "parsed",
			brief: "The fusion_method field",
			optional: true,
			choices: ["max", "rrf"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "fusion-method", "text"),
		},
		"index-method-keyword": {
			kind: "boolean",
			brief: "Enable keyword (BM25) storage backend.",
			optional: true,
		},
		"index-method-vector": {
			kind: "boolean",
			brief: "Enable vector (embedding) storage backend.",
			optional: true,
		},
		"indexing-options-file-summary": {
			kind: "boolean",
			brief:
				"Generates a per-file summary, topics, and keywords during indexing for text files and media transcripts of at least three chunks. The summary and keywords are stored as the item's context metadata (a context you set is kept), and the topics are added to chunk context headers where they fit. Best effort: a file whose summary fails is indexed without one. The model calls are billed to your account through the instance's AI Gateway. Changing this triggers a full re-index. Defaults to false.",
			optional: true,
		},
		"indexing-options-keyword-tokenizer": {
			kind: "parsed",
			brief:
				"Tokenizer used for keyword search indexing. porter provides word-level tokenization with Porter stemming (good for natural language queries). trigram enables character-level substring matching (good for partial matches, code, identifiers). Changing this triggers a full re-index. Defaults to porter.",
			optional: true,
			choices: ["porter", "trigram"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "indexing-options-keyword-tokenizer", "text"),
		},
		"indexing-options-use-ocr": {
			kind: "boolean",
			brief:
				"Enables OCR ingestion for PDFs and images. Changing this triggers a full re-index. Defaults to false.",
			optional: true,
		},
		"max-num-results": {
			kind: "parsed",
			brief: "The max_num_results field",
			optional: true,
			parse: Number,
		},
		"metadata-created-from-aisearch-wizard": {
			kind: "boolean",
			brief: "The metadata.created_from_aisearch_wizard field",
			optional: true,
		},
		"metadata-created-from-emdash-plugin-type": {
			kind: "parsed",
			brief: "The metadata.created_from_emdash_plugin.type field",
			optional: true,
			choices: ["native", "rest"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"metadata-created-from-emdash-plugin-type",
					"text"
				),
		},
		"metadata-created-from-emdash-plugin-version": {
			kind: "parsed",
			brief: "The metadata.created_from_emdash_plugin.version field",
			optional: true,
			parse: String,
		},
		"metadata-worker-domain": {
			kind: "parsed",
			brief: "The metadata.worker_domain field",
			optional: true,
			parse: String,
		},
		paused: { kind: "boolean", brief: "The paused field", optional: true },
		"public-endpoint-params-authorized-hosts": {
			kind: "parsed",
			brief: "The public_endpoint_params.authorized_hosts field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-endpoint-params-chat-completions-endpoint-disabled": {
			kind: "boolean",
			brief: "Disable chat completions endpoint for this public endpoint.",
			optional: true,
		},
		"public-endpoint-params-custom-domains": {
			kind: "parsed",
			brief:
				"Custom domain hostnames that alias this public endpoint. GET and create responses return the current set; on update (PUT) this field is only echoed back when supplied in the request body, otherwise it is null (omit it to leave domains unchanged).",
			variadic: true,
			optional: true,
			parse: String,
		},
		"public-endpoint-params-default-domain-enabled": {
			kind: "boolean",
			brief:
				"When false, the instance is reachable only via a registered custom domain and the default <public_endpoint_id>.search.ai.cloudflare.com host returns 404. Requires at least one custom domain. Defaults to true. public_endpoint_params is replaced wholesale on update, so resend default_domain_enabled on every update to keep the default host off — omitting it resets to true.",
			optional: true,
		},
		"public-endpoint-params-enabled": {
			kind: "boolean",
			brief: "The public_endpoint_params.enabled field",
			optional: true,
		},
		"public-endpoint-params-mcp-description": {
			kind: "parsed",
			brief: "The public_endpoint_params.mcp.description field",
			optional: true,
			parse: String,
		},
		"public-endpoint-params-mcp-disabled": {
			kind: "boolean",
			brief: "Disable MCP endpoint for this public endpoint.",
			optional: true,
		},
		"public-endpoint-params-rate-limit-period-ms": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.period_ms field",
			optional: true,
			parse: Number,
		},
		"public-endpoint-params-rate-limit-requests": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.requests field",
			optional: true,
			parse: Number,
		},
		"public-endpoint-params-rate-limit-technique": {
			kind: "parsed",
			brief: "The public_endpoint_params.rate_limit.technique field",
			optional: true,
			choices: ["fixed", "sliding"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"public-endpoint-params-rate-limit-technique",
					"text"
				),
		},
		"public-endpoint-params-search-endpoint-disabled": {
			kind: "boolean",
			brief: "Disable search endpoint for this public endpoint.",
			optional: true,
		},
		reranking: {
			kind: "boolean",
			brief: "The reranking field",
			optional: true,
		},
		"reranking-model": {
			kind: "parsed",
			brief: "The reranking_model field",
			optional: true,
			parse: String,
		},
		"retrieval-options-boost-by": {
			kind: "parsed",
			brief:
				'Metadata fields to boost search results by. Each entry specifies a metadata field and an optional direction. Direction defaults to \'asc\' for numeric/datetime fields and \'exists\' for text/boolean fields. Fields must match \'timestamp\' or a defined custom_metadata field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"field": string, "direction"?: "asc" | "desc" | "exists" | ...more}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"retrieval-options-keyword-match-mode": {
			kind: "parsed",
			brief:
				"Controls which documents become candidates for BM25 scoring. 'and' restricts candidates to documents containing all query terms; 'or' includes any document containing at least one term and ranks results according to BM25 relevance. When omitted on an update, the existing stored value stays unchanged; when never set, search falls back to 'and'.",
			optional: true,
			choices: ["and", "or"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "retrieval-options-keyword-match-mode", "text"),
		},
		"rewrite-model": {
			kind: "parsed",
			brief:
				"A Workers AI model ID or an AI Gateway model ID compatible with the OpenAI Chat Completions API. An empty string uses the configured or default model.",
			optional: true,
			parse: String,
		},
		"rewrite-query": {
			kind: "boolean",
			brief: "The rewrite_query field",
			optional: true,
		},
		"score-threshold": {
			kind: "parsed",
			brief:
				"Minimum similarity score a chunk must reach to be returned. Defaults to 0.4.",
			optional: true,
			parse: Number,
		},
		source: {
			kind: "parsed",
			brief: "R2 bucket name or HTTP(S) root website URL to index.",
			optional: true,
			parse: String,
		},
		"source-params-d1-query": {
			kind: "parsed",
			brief:
				"Read-only SELECT query run against the D1 database. It must return an `id` column that uniquely identifies each row. Columns named `title` and `content` set the document title and body, and up to 5 `meta_*` columns become filterable custom metadata; any other column is indexed as a labelled field. Every sync reads the full result, up to 100,000 rows, with the instance's token, and those reads count against your D1 usage. Leading and trailing whitespace is trimmed before the query is stored. Omit to keep the stored query.",
			optional: true,
			parse: String,
		},
		"source-params-d1-template": {
			kind: "parsed",
			brief:
				"How each row is rendered into the indexed document: labelled renders the title, the labelled fields, then the content; content_only renders the title and content (labelled fields only when there is no content); key_value renders every column as name: value; json renders every column as a JSON object. Omit to keep the stored template.",
			optional: true,
			choices: ["labelled", "content_only", "key_value", "json"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-params-d1-template", "text"),
		},
		"source-params-exclude-items": {
			kind: "parsed",
			brief:
				"List of path patterns to exclude. Uses micromatch glob syntax: * matches within a path segment, ** matches across path segments (e.g., /admin/** matches /admin/users and /admin/settings/advanced). Most accounts have a limit of 10 rules; contact support to raise it.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-params-include-items": {
			kind: "parsed",
			brief:
				"List of path patterns to include. Uses micromatch glob syntax: * matches within a path segment, ** matches across path segments (e.g., /blog/** matches /blog/post and /blog/2024/post). Most accounts have a limit of 10 rules; contact support to raise it.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-params-prefix": {
			kind: "parsed",
			brief: "The source_params.prefix field",
			optional: true,
			parse: String,
		},
		"source-params-r2-jurisdiction": {
			kind: "parsed",
			brief: "The source_params.r2_jurisdiction field",
			optional: true,
			parse: String,
		},
		"source-params-web-crawler-discover-options-depth": {
			kind: "parsed",
			brief: "Maximum link-follow depth from the seed URL.",
			optional: true,
			parse: Number,
		},
		"source-params-web-crawler-discover-options-include-external-links": {
			kind: "boolean",
			brief:
				"Follow links that point outside the source domain. Must stay `false` because discover crawls only cover the zone you own.",
			optional: true,
		},
		"source-params-web-crawler-discover-options-include-subdomains": {
			kind: "boolean",
			brief: "Follow links to subdomains of the source host.",
			optional: true,
		},
		"source-params-web-crawler-discover-options-limit": {
			kind: "parsed",
			brief: "Maximum number of pages to crawl (1-100000).",
			optional: true,
			parse: Number,
		},
		"source-params-web-crawler-discover-options-max-age": {
			kind: "parsed",
			brief: "Maximum content age in seconds to accept (0–604800).",
			optional: true,
			parse: Number,
		},
		"source-params-web-crawler-discover-options-source": {
			kind: "parsed",
			brief:
				"Where the crawler looks for URLs: 'sitemaps' reads sitemap XML only, 'links' follows page links only, 'all' does both.",
			optional: true,
			choices: ["all", "sitemaps", "links"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"source-params-web-crawler-discover-options-source",
					"text"
				),
		},
		"source-params-web-crawler-parse-options-content-selector": {
			kind: "parsed",
			brief:
				'List of path-to-selector mappings for extracting specific content from crawled pages. Each entry pairs a URL glob pattern with a CSS selector. The first matching path wins. The crawler stores and indexes only the matched HTML fragment. Omit the field to disable content selection; the API rejects empty arrays. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"path": string, "selector": string}].',
			optional: true,
			parse: String,
		},
		"source-params-web-crawler-parse-options-include-headers": {
			kind: "parsed",
			brief:
				'Up to 5 custom HTTP headers sent with each crawl request. Names must use RFC-7230 token characters, excluding spaces, colons, and control characters. Values must use HTAB and printable ASCII only, excluding CR and LF. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
			optional: true,
			parse: String,
		},
		"source-params-web-crawler-parse-options-include-images": {
			kind: "boolean",
			brief: "The source_params.web_crawler.parse_options.include_images field",
			optional: true,
		},
		"source-params-web-crawler-parse-options-specific-sitemaps": {
			kind: "parsed",
			brief:
				"List of specific sitemap URLs to use for crawling. Only valid when parse_type is 'sitemap'.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-params-web-crawler-parse-options-use-browser-rendering": {
			kind: "boolean",
			brief:
				"The source_params.web_crawler.parse_options.use_browser_rendering field",
			optional: true,
		},
		"source-params-web-crawler-parse-type": {
			kind: "parsed",
			brief:
				"How the crawler finds URLs. 'sitemap' reads XML sitemaps; 'discover' follows links recursively and requires the source to belong to a Verified zone on this account.",
			optional: true,
			choices: ["sitemap", "discover"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-params-web-crawler-parse-type", "text"),
		},
		summarization: {
			kind: "boolean",
			brief:
				"Deprecated and ignored during indexing and search; changing it still re-indexes existing files on the next sync. Use indexing_options.file_summary instead.",
			optional: true,
		},
		"summarization-model": {
			kind: "parsed",
			brief:
				"Deprecated and ignored during indexing and search; changing it still re-indexes existing files on the next sync. Use indexing_options.file_summary instead.",
			optional: true,
			parse: String,
		},
		"sync-interval": {
			kind: "parsed",
			brief:
				"Interval between automatic syncs, in seconds. Allowed values: 900 (15min), 1800 (30min), 3600 (1h), 7200 (2h), 14400 (4h), 21600 (6h), 43200 (12h), 86400 (24h). Defaults to 86400 (24h).",
			optional: true,
			parse: Number,
		},
		"system-prompt-ai-search": {
			kind: "parsed",
			brief: "The system_prompt_ai_search field",
			optional: true,
			parse: String,
		},
		"system-prompt-index-summarization": {
			kind: "parsed",
			brief:
				"Deprecated and has no effect. Use indexing_options.file_summary instead.",
			optional: true,
			parse: String,
		},
		"system-prompt-rewrite-query": {
			kind: "parsed",
			brief: "The system_prompt_rewrite_query field",
			optional: true,
			parse: String,
		},
		"token-id": {
			kind: "parsed",
			brief: "The token_id field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "instance-id",
			brief: "AI Search instance ID.",
			parse: String,
		},
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = ["index-method-keyword", "index-method-vector"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["index-method-keyword", "index-method-vector"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --index-method-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"metadata-created-from-emdash-plugin-type",
				"metadata-created-from-emdash-plugin-version",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"metadata-created-from-emdash-plugin-type",
					"metadata-created-from-emdash-plugin-version",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --metadata-created-from-emdash-plugin-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <instance-id>",
	describe: "Update an AI Search instance.",
	usage:
		"$0 ai-search update <instance-id>\n\nUpdates the configuration of an AI Search instance.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
