import $create from "./create.js";
import $delete from "./delete.js";
import $entrypoint from "./entrypoint/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $rules from "./rules/index.js";
import $update from "./update.js";
/**
 * rulesets command
 * @generated from apis/overlays/rulesets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rulesets",
	describe:
		"Versioned collections of rules that control how Cloudflare processes traffic — WAF, transform, redirect, and more",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		entrypoint: $entrypoint,
		rules: $rules,
	},
});

export default command;
