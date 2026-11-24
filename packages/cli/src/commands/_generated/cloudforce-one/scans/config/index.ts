import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $list from "./list.js";
/**
 * config command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "config",
	describe: "Operations for scans.config",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		list: $list,
	},
});

export default command;
