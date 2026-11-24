import $content from "./content/index.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $rules from "./rules/index.js";
import $update from "./update.js";
/**
 * snippets command
 * @generated from apis/overlays/snippets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "snippets",
	describe: "snippets",

	routes: {
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		content: $content,
		rules: $rules,
	},
});

export default command;
