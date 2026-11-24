import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $regions from "./regions/index.js";
/**
 * regional-hostnames command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "regional-hostnames",
	describe: "Operations for regional-hostnames",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		regions: $regions,
	},
});

export default command;
