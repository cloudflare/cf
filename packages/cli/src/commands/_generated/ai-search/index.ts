import $chatcompletions from "./chat-completions.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $items from "./items/index.js";
import $jobs from "./jobs/index.js";
import $list from "./list.js";
import $move from "./move.js";
import $multichatcompletions from "./multi-chat-completions.js";
import $multisearch from "./multi-search.js";
import $namespace from "./namespace/index.js";
import $purgecache from "./purge-cache.js";
import $search from "./search.js";
import $stats from "./stats.js";
import $tokens from "./tokens/index.js";
import $update from "./update.js";
/**
 * ai-search command
 * @generated from apis/overlays/ai-search.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ai-search",
	describe:
		"Managed search-as-a-service: crawl, index, and query content with AI-powered relevance and chat completions",

	routes: {
		"chat-completions": $chatcompletions,
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		move: $move,
		"multi-chat-completions": $multichatcompletions,
		"multi-search": $multisearch,
		"purge-cache": $purgecache,
		search: $search,
		stats: $stats,
		update: $update,
		items: $items,
		jobs: $jobs,
		namespace: $namespace,
		tokens: $tokens,
	},
});

export default command;
