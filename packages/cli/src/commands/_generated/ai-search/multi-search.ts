/**
 * multi-search command
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
		"ai-search-options-cache-cache-threshold": {
			kind: "parsed",
			brief: "The ai_search_options.cache.cache_threshold field",
			optional: true,
			choices: [
				"super_strict_match",
				"close_enough",
				"flexible_friend",
				"anything_goes",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"ai-search-options-cache-cache-threshold",
					"text"
				),
		},
		"ai-search-options-cache-enabled": {
			kind: "boolean",
			brief: "The ai_search_options.cache.enabled field",
			optional: true,
		},
		"ai-search-options-custom-metadata": {
			kind: "parsed",
			brief:
				"Metadata added to AI Gateway logs for requests this operation triggers. Accepts up to 2 string, number, or boolean entries. Reserved keys: 'ai-search', 'task', 'origin', and any key beginning with 'cf.'. Provide as a JSON object or @path/to/file.json. Shape: {\"<key>\": (string | number | boolean)}.",
			optional: true,
			parse: String,
		},
		"ai-search-options-instance-ids": {
			kind: "parsed",
			brief: "The ai_search_options.instance_ids field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"ai-search-options-query-rewrite-enabled": {
			kind: "boolean",
			brief: "The ai_search_options.query_rewrite.enabled field",
			optional: true,
		},
		"ai-search-options-query-rewrite-model": {
			kind: "parsed",
			brief:
				"A Workers AI model ID or an AI Gateway model ID compatible with the OpenAI Chat Completions API. An empty string uses the configured or default model.",
			optional: true,
			parse: String,
		},
		"ai-search-options-query-rewrite-rewrite-prompt": {
			kind: "parsed",
			brief: "The ai_search_options.query_rewrite.rewrite_prompt field",
			optional: true,
			parse: String,
		},
		"ai-search-options-reranking-enabled": {
			kind: "boolean",
			brief: "The ai_search_options.reranking.enabled field",
			optional: true,
		},
		"ai-search-options-reranking-match-threshold": {
			kind: "parsed",
			brief:
				"Minimum reranker relevance score a chunk must reach to be returned. When omitted, falls back to the instance-level score_threshold, then to 0.4.",
			optional: true,
			parse: Number,
		},
		"ai-search-options-reranking-model": {
			kind: "parsed",
			brief: "The ai_search_options.reranking.model field",
			optional: true,
			parse: String,
		},
		"ai-search-options-retrieval-boost-by": {
			kind: "parsed",
			brief:
				'Metadata fields to boost search results by. Overrides the instance-level boost_by config. Direction defaults to \'asc\' for numeric/datetime fields, \'exists\' for text/boolean fields. Fields must match \'timestamp\' or a defined custom_metadata field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"field": string, "direction"?: "asc" | "desc" | "exists" | ...more}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"ai-search-options-retrieval-context-expansion": {
			kind: "parsed",
			brief: "The ai_search_options.retrieval.context_expansion field",
			optional: true,
			parse: Number,
		},
		"ai-search-options-retrieval-filters": {
			kind: "parsed",
			brief:
				'The ai_search_options.retrieval.filters field. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"ai-search-options-retrieval-fusion-method": {
			kind: "parsed",
			brief: "The ai_search_options.retrieval.fusion_method field",
			optional: true,
			choices: ["max", "rrf"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"ai-search-options-retrieval-fusion-method",
					"text"
				),
		},
		"ai-search-options-retrieval-keyword-match-mode": {
			kind: "parsed",
			brief:
				"Controls which documents become candidates for BM25 scoring. 'and' restricts candidates to documents containing all query terms; 'or' includes any document containing at least one term and ranks results according to BM25 relevance. When omitted, falls back to the instance-level retrieval_options.keyword_match_mode, then to 'and'.",
			optional: true,
			choices: ["and", "or"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"ai-search-options-retrieval-keyword-match-mode",
					"text"
				),
		},
		"ai-search-options-retrieval-match-threshold": {
			kind: "parsed",
			brief:
				"Minimum score a chunk must reach to be returned. When omitted, each instance's chunks are filtered by that instance's score_threshold, capped at 0.4.",
			optional: true,
			parse: Number,
		},
		"ai-search-options-retrieval-max-num-results": {
			kind: "parsed",
			brief:
				"Maximum number of merged results to return. When omitted, defaults to the sum of the searched instances' max_num_results (each falling back to 10), up to 50.",
			optional: true,
			parse: Number,
		},
		"ai-search-options-retrieval-retrieval-type": {
			kind: "parsed",
			brief: "The ai_search_options.retrieval.retrieval_type field",
			optional: true,
			choices: ["vector", "keyword", "hybrid"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"ai-search-options-retrieval-retrieval-type",
					"text"
				),
		},
		"ai-search-options-retrieval-return-on-failure": {
			kind: "boolean",
			brief: "The ai_search_options.retrieval.return_on_failure field",
			optional: true,
		},
		messages: {
			kind: "parsed",
			brief:
				"OpenAI-compatible message array. For multimodal queries, set the last user message's `content` to an array of typed parts: `[{type:'text', text:'…'}, {type:'image_url', image_url:{url:'…'}}]`. Image inputs require the RAG's embedding_model to declare 'image' in supported_modalities. Provide as a JSON array of objects or @path/to/file.json. Shape: [{\"content\": (string | [{...}] | null), \"role\": \"system\" | \"developer\" | \"user\" | ...more, \"<key>\": unknown}].",
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
			placeholder: "query",
			brief: "Text to search for.",
			parse: String,
			optional: true,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "multi-search [query]",
	describe: "Multi-Instance Search",
	usage:
		"$0 ai-search multi-search [query]\n\nPerforms a semantic search query against multiple AI Search instances in parallel, merging the retrieved results into a single ranked response.",
	...parameters,
	loader: () => import("./multi-search.handler.js"),
});

export default command;
