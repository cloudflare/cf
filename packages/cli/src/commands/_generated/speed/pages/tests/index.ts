import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * tests command group
 * @generated from apis/overlays/speed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tests",
	describe: "Operations for pages.tests",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
