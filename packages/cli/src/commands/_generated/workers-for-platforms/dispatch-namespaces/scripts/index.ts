import $bindings from "./bindings/index.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $secrets from "./secrets/index.js";
import $settings from "./settings/index.js";
import $tags from "./tags/index.js";
/**
 * scripts command group
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scripts",
	describe:
		"Operations around customer Workers deployed inside a dispatch namespace",

	routes: {
		delete: $delete,
		get: $get,
		list: $list,
		bindings: $bindings,
		secrets: $secrets,
		settings: $settings,
		tags: $tags,
	},
});

export default command;
