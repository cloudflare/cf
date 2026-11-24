import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * connectors command
 * @generated from apis/overlays/connectors.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connectors",
	describe: "connectors",

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
