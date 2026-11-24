import $invalidateenvironment from "./invalidate-environment.js";
import $invalidate from "./invalidate.js";
import $origincloudregions from "./origin-cloud-regions/index.js";
import $purgeenvironment from "./purge-environment.js";
import $purge from "./purge.js";
import $settings from "./settings/index.js";
/**
 * cache command
 * @generated from apis/overlays/cache.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cache",
	describe:
		"Purge cached content and configure Cache Reserve, tiered caching, and variant serving",

	routes: {
		invalidate: $invalidate,
		"invalidate-environment": $invalidateenvironment,
		purge: $purge,
		"purge-environment": $purgeenvironment,
		"origin-cloud-regions": $origincloudregions,
		settings: $settings,
	},
});

export default command;
