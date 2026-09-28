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
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * ai-search command
 * @generated from apis/overlays/ai-search.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "ai-search",
	describe:
		"Managed search-as-a-service: crawl, index, and query content with AI-powered relevance and chat completions",

	builder: (yargs) => {
		return yargs
			.command($chatcompletions)
			.command($create)
			.command($delete)
			.command($get)
			.command($list)
			.command($move)
			.command($multichatcompletions)
			.command($multisearch)
			.command($purgecache)
			.command($search)
			.command($stats)
			.command($update)
			.command($items)
			.command($jobs)
			.command($namespace)
			.command($tokens)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
