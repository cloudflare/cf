import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * variants command group
 * @generated from apis/overlays/images.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "variants",
	describe: "Manage named resize variants for transforming images on delivery",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
