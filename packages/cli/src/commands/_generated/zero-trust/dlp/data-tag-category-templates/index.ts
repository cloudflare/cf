import $get from "./get.js";
import $list from "./list.js";
/**
 * data-tag-category-templates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "data-tag-category-templates",
	describe:
		"Data Loss Prevention - browse templates for creating data tag categories",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
