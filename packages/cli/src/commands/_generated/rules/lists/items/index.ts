import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * items command group
 * @generated from apis/overlays/rules.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "items",
	describe: "Operations for lists.items",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
