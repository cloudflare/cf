import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * chat-completions command
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
			"$0 ai-search chat-completions <id>\n\nPerforms a chat completion request against an AI Search instance, using indexed content as context for generating responses."
		)
		.positional("id", {
			type: "string",
			description: "AI Search instance ID.",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description: "Namespace to use for this operation.",
			demandOption: true,
		})
		.option("ai-search-options-cache-cache-threshold", {
			type: "string",
			description: "The ai_search_options.cache.cache_threshold field",
			choices: [
				"super_strict_match",
				"close_enough",
				"flexible_friend",
				"anything_goes",
			],
		})
		.option("ai-search-options-cache-enabled", {
			type: "boolean",
			description: "The ai_search_options.cache.enabled field",
		})
		.option("ai-search-options-query-rewrite-enabled", {
			type: "boolean",
			description: "The ai_search_options.query_rewrite.enabled field",
		})
		.option("ai-search-options-query-rewrite-model", {
			type: "string",
			description:
				"A Workers AI model ID or an AI Gateway model ID compatible with the OpenAI Chat Completions API. An empty string uses the configured or default model.",
		})
		.option("ai-search-options-query-rewrite-rewrite-prompt", {
			type: "string",
			description: "The ai_search_options.query_rewrite.rewrite_prompt field",
		})
		.option("ai-search-options-reranking-enabled", {
			type: "boolean",
			description: "The ai_search_options.reranking.enabled field",
		})
		.option("ai-search-options-reranking-match-threshold", {
			type: "number",
			description: "The ai_search_options.reranking.match_threshold field",
		})
		.option("ai-search-options-reranking-model", {
			type: "string",
			description: "The ai_search_options.reranking.model field",
		})
		.option("ai-search-options-retrieval-context-expansion", {
			type: "number",
			description: "The ai_search_options.retrieval.context_expansion field",
		})
		.option("ai-search-options-retrieval-fusion-method", {
			type: "string",
			description: "The ai_search_options.retrieval.fusion_method field",
			choices: ["max", "rrf"],
		})
		.option("ai-search-options-retrieval-keyword-match-mode", {
			type: "string",
			description:
				"Controls which documents are candidates for BM25 scoring. 'and' restricts candidates to documents containing all query terms; 'or' includes any document containing at least one term, ranked by BM25 relevance. When omitted, falls back to the instance-level retrieval_options.keyword_match_mode, then to 'and'.",
			choices: ["and", "or"],
		})
		.option("ai-search-options-retrieval-match-threshold", {
			type: "number",
			description: "The ai_search_options.retrieval.match_threshold field",
		})
		.option("ai-search-options-retrieval-max-num-results", {
			type: "number",
			description: "The ai_search_options.retrieval.max_num_results field",
		})
		.option("ai-search-options-retrieval-retrieval-type", {
			type: "string",
			description: "The ai_search_options.retrieval.retrieval_type field",
			choices: ["vector", "keyword", "hybrid"],
		})
		.option("ai-search-options-retrieval-return-on-failure", {
			type: "boolean",
			description: "The ai_search_options.retrieval.return_on_failure field",
		})
		.option("messages", {
			type: "string",
			description:
				"The messages field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("model", {
			type: "string",
			description:
				"A Workers AI model ID or an AI Gateway model ID compatible with the OpenAI Chat Completions API. An empty string uses the configured or default model.",
		})
		.option("stream", { type: "boolean", description: "The stream field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"ai-search-namespace-instance-chat-completion">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "chat-completions <id>",
	describe: "Chat Completions",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search chat-completions",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/instances/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/chat/completions`,
						pathParams: {
							id: String(argv["id"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ai_search_options: {
											cache: {
												cache_threshold: resolveFileToken(
													argv["ai-search-options-cache-cache-threshold"] as
														| string
														| undefined,
													"ai-search-options-cache-cache-threshold",
													"text"
												),
												enabled: argv["ai-search-options-cache-enabled"],
											},
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
												context_expansion:
													argv["ai-search-options-retrieval-context-expansion"],
												fusion_method: resolveFileToken(
													argv["ai-search-options-retrieval-fusion-method"] as
														| string
														| undefined,
													"ai-search-options-retrieval-fusion-method",
													"text"
												),
												keyword_match_mode: resolveFileToken(
													argv[
														"ai-search-options-retrieval-keyword-match-mode"
													] as string | undefined,
													"ai-search-options-retrieval-keyword-match-mode",
													"text"
												),
												match_threshold:
													argv["ai-search-options-retrieval-match-threshold"],
												max_num_results:
													argv["ai-search-options-retrieval-max-num-results"],
												retrieval_type: resolveFileToken(
													argv["ai-search-options-retrieval-retrieval-type"] as
														| string
														| undefined,
													"ai-search-options-retrieval-retrieval-type",
													"text"
												),
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.aiSearch.chatCompletions({
							...bodyData,
							account_id: accountId,
							name: argv["name"],
							id: argv["id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["messages"] === undefined) {
					throw new Error(
						"--messages is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					ai_search_options: {
						cache: {
							cache_threshold: resolveFileToken(
								argv["ai-search-options-cache-cache-threshold"] as
									| string
									| undefined,
								"ai-search-options-cache-cache-threshold",
								"text"
							),
							enabled: argv["ai-search-options-cache-enabled"],
						},
						query_rewrite: {
							enabled: argv["ai-search-options-query-rewrite-enabled"],
							model: resolveFileToken(
								argv["ai-search-options-query-rewrite-model"] as
									| string
									| undefined,
								"ai-search-options-query-rewrite-model",
								"text"
							),
							rewrite_prompt: resolveFileToken(
								argv["ai-search-options-query-rewrite-rewrite-prompt"] as
									| string
									| undefined,
								"ai-search-options-query-rewrite-rewrite-prompt",
								"text"
							),
						},
						reranking: {
							enabled: argv["ai-search-options-reranking-enabled"],
							match_threshold:
								argv["ai-search-options-reranking-match-threshold"],
							model: resolveFileToken(
								argv["ai-search-options-reranking-model"] as string | undefined,
								"ai-search-options-reranking-model",
								"text"
							),
						},
						retrieval: {
							context_expansion:
								argv["ai-search-options-retrieval-context-expansion"],
							fusion_method: resolveFileToken(
								argv["ai-search-options-retrieval-fusion-method"] as
									| string
									| undefined,
								"ai-search-options-retrieval-fusion-method",
								"text"
							),
							keyword_match_mode: resolveFileToken(
								argv["ai-search-options-retrieval-keyword-match-mode"] as
									| string
									| undefined,
								"ai-search-options-retrieval-keyword-match-mode",
								"text"
							),
							match_threshold:
								argv["ai-search-options-retrieval-match-threshold"],
							max_num_results:
								argv["ai-search-options-retrieval-max-num-results"],
							retrieval_type: resolveFileToken(
								argv["ai-search-options-retrieval-retrieval-type"] as
									| string
									| undefined,
								"ai-search-options-retrieval-retrieval-type",
								"text"
							),
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
				});
				const result = await withProgress(`Creating`, async () =>
					client.aiSearch.chatCompletions({
						...bodyData,
						account_id: accountId,
						name: argv["name"],
						id: argv["id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
