import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * resources command group
 * @generated from apis/overlays/resource-sharing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "resources",
	describe: "Resources attached to a share",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
