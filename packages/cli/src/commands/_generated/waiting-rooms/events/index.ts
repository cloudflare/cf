import $create from "./create.js";
import $delete from "./delete.js";
import $details from "./details/index.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * events command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "events",
	describe:
		"Scheduled events that temporarily override waiting room settings for sales, launches, etc.",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
		details: $details,
	},
});

export default command;
