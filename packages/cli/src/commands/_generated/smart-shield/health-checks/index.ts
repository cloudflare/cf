import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * health-checks command group
 * @generated from apis/overlays/smart-shield.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "health-checks",
	describe: "Health checks operations",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
