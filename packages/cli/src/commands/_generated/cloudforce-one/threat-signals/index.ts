import $articles from "./articles/index.js";
import $categories from "./categories/index.js";
import $feeds from "./feeds/index.js";
import $indicators from "./indicators/index.js";
import $search from "./search.js";
import $skills from "./skills/index.js";
/**
 * threat-signals command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "threat-signals",
	describe: "Operations for threat-signals",

	routes: {
		search: $search,
		articles: $articles,
		categories: $categories,
		feeds: $feeds,
		indicators: $indicators,
		skills: $skills,
	},
});

export default command;
