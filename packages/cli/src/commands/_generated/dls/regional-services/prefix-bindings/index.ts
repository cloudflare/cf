import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * prefix-bindings command group
 * @generated from apis/overlays/dls.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "prefix-bindings",
	describe: "Operations for regional-services.prefix-bindings",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
