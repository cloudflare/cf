import $regionaltieredcache from "./regional-tiered-cache/index.js";
import $reserve from "./reserve/index.js";
import $smarttieredcache from "./smart-tiered-cache/index.js";
import $variants from "./variants/index.js";
/**
 * settings command group
 * @generated from apis/overlays/cache.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Configure Cache Reserve, tiered caching, and variant serving",

	routes: {
		"regional-tiered-cache": $regionaltieredcache,
		reserve: $reserve,
		"smart-tiered-cache": $smarttieredcache,
		variants: $variants,
	},
});

export default command;
