import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * rules command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe:
		"Rules that bypass or modify waiting room behavior for specific request patterns",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		list: $list,
		update: $update,
	},
});

export default command;
