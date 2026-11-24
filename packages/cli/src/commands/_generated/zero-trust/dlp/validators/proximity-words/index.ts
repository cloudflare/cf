import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * proximity-words command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "proximity-words",
	describe: "Data Loss Prevention - manage proximity-word validators",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
