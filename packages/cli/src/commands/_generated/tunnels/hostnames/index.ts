import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * hostnames command group
 * @generated from apis/overlays/tunnels.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hostnames",
	describe: "Operations for hostnames",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
