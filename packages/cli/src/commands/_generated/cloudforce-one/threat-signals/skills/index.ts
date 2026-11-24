import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $tagcategories from "./tag-categories/index.js";
import $update from "./update.js";
/**
 * skills command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "skills",
	describe: "Operations for threat-signals.skills",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		"tag-categories": $tagcategories,
	},
});

export default command;
