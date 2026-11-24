import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * ramps command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ramps",
	describe: "Operations for cf1-sites.ramps",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
