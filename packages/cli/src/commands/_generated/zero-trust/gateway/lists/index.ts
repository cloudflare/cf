import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $items from "./items/index.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * lists command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "lists",
	describe: "Operations for gateway.lists",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
		items: $items,
	},
});

export default command;
