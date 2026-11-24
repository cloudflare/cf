import $deleteall from "./delete-all.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * rules command group
 * @generated from apis/overlays/monetization.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe: "Operations for rules",

	routes: {
		delete: $delete,
		"delete-all": $deleteall,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
